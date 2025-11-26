"""
Base class for LLM-powered review agents supporting OpenAI and Gemini.
"""
from abc import abstractmethod
from typing import List
import json
import logging
from openai import OpenAI, APIError, APITimeoutError, RateLimitError
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.agents.base import BaseAgent
from app.diff_parser import ParsedChange
from app.models import ReviewComment
from app.config import settings
from app.utils.code_context import (
    detect_language,
    group_changes_by_file,
    create_code_block,
    should_skip_file
)
from app.utils.prompts import get_analysis_prompt, SYSTEM_PROMPT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMAgent(BaseAgent):
    """
    Base class for all LLM-powered agents supporting OpenAI and Gemini.
    Handles API calls, retries, and response parsing.
    """
    
    agent_type: str  # Must be set by subclass: "logic", "security", etc.
    
    def __init__(self):
        self.max_tokens = settings.MAX_TOKENS_PER_REQUEST
        self.temperature = settings.LLM_TEMPERATURE
        
        self.provider = settings.LLM_PROVIDER.lower()
        
        if self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError(f"{self.name} requires OPENAI_API_KEY when using OpenAI provider")
            
            client_kwargs = {
                "api_key": settings.OPENAI_API_KEY
            }
            
            if settings.OPENAI_BASE_URL:
                client_kwargs["base_url"] = settings.OPENAI_BASE_URL
            
            self.client = OpenAI(**client_kwargs)
            self.model = settings.OPENAI_MODEL
            
        elif self.provider == "gemini":
            self.gemini_api_keys = settings.get_gemini_keys()
            if not self.gemini_api_keys:
                raise ValueError(f"{self.name} requires GEMINI_API_KEY or GEMINI_API_KEYS when using Gemini provider")
            
            self.current_key_index = 0
            self.model = settings.GEMINI_MODEL
            
            self._init_gemini_client(self.gemini_api_keys[0])
            
            logger.info(f"[{self.name}] Initialized with {len(self.gemini_api_keys)} Gemini API key(s)")
            
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}. Use 'openai' or 'gemini'")
    
    def _init_gemini_client(self, api_key: str):
        """Initialize or reinitialize Gemini client with a specific API key."""
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel(
            model_name=self.model,
            generation_config={
                "temperature": self.temperature,
                "max_output_tokens": self.max_tokens,
            }
        )
        self.current_api_key = api_key
    
    def _rotate_gemini_key(self) -> bool:
        """
        Rotate to the next Gemini API key.
        Returns True if rotation was successful, False if no more keys available.
        """
        if len(self.gemini_api_keys) <= 1:
            logger.warning(f"[{self.name}] No additional API keys available for rotation")
            return False
        
        self.current_key_index = (self.current_key_index + 1) % len(self.gemini_api_keys)
        next_key = self.gemini_api_keys[self.current_key_index]
        
        logger.info(f"[{self.name}] Rotating to API key #{self.current_key_index + 1}/{len(self.gemini_api_keys)}")
        
        self._init_gemini_client(next_key)
        return True
    
    def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
        """
        Main review method - analyzes changes and returns comments.
        """
        if not changes:
            logger.info(f"[{self.name}] No changes to review")
            return []
        
        grouped = group_changes_by_file(changes)
        all_comments: List[ReviewComment] = []
        
        for file_path, file_changes in grouped.items():
            if should_skip_file(file_path):
                logger.info(f"[{self.name}] Skipping {file_path}")
                continue
            
            batch_size = settings.BATCH_SIZE
            for i in range(0, len(file_changes), batch_size):
                batch = file_changes[i:i + batch_size]
                
                try:
                    logger.info(f"[{self.name}] Analyzing {file_path} (batch {i//batch_size + 1}, {len(batch)} changes)")
                    comments = self._analyze_batch(batch, file_path)
                    all_comments.extend(comments)
                    logger.info(f"[{self.name}] Found {len(comments)} issues in batch")
                except Exception as e:
                    logger.error(f"[{self.name}] Error analyzing {file_path}: {e}", exc_info=True)
                    continue
        
        logger.info(f"[{self.name}] Total issues found: {len(all_comments)}")
        return all_comments
    
    def _analyze_batch(self, changes: List[ParsedChange], file_path: str) -> List[ReviewComment]:
        """
        Analyze a batch of changes for a single file.
        """
        language = detect_language(file_path)
        code_block = create_code_block(changes)
        
        logger.debug(f"[{self.name}] Code block:\n{code_block[:200]}...")
        
        prompt = get_analysis_prompt(self.agent_type, code_block, file_path, language)
        
        logger.debug(f"[{self.name}] Prompt length: {len(prompt)} chars")
        
        response_text = self._call_llm(prompt)
        
        logger.debug(f"[{self.name}] Raw LLM response:\n{response_text[:500]}...")
        
        comments = self._parse_llm_response(response_text, changes, file_path)
        
        return comments
    
    @retry(
        stop=stop_after_attempt(settings.MAX_RETRIES),
        wait=wait_exponential(multiplier=settings.RETRY_DELAY, min=1, max=10),
        retry=retry_if_exception_type((APITimeoutError, RateLimitError, APIError)),
        reraise=True
    )
    def _call_llm(self, prompt: str) -> str:
        """
        Call LLM API (OpenAI or Gemini) with retry logic.
        """
        if self.provider == "openai":
            return self._call_openai(prompt)
        elif self.provider == "gemini":
            return self._call_gemini(prompt)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _call_openai(self, prompt: str) -> str:
        """
        Call OpenAI API.
        """
        try:
            logger.info(f"[{self.name}] Calling OpenAI API with model {self.model}")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )
            
            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content
                if content:
                    logger.info(f"[{self.name}] Received response from OpenAI ({len(content)} chars)")
                    return content
                else:
                    logger.warning(f"[{self.name}] Empty response from OpenAI")
                    return '{"issues": []}'
            else:
                logger.warning(f"[{self.name}] No choices in OpenAI response")
                return '{"issues": []}'
                
        except APITimeoutError as e:
            logger.error(f"[{self.name}] API timeout: {e}")
            raise
        except RateLimitError as e:
            logger.error(f"[{self.name}] Rate limit exceeded: {e}")
            raise
        except APIError as e:
            logger.error(f"[{self.name}] API error: {e}")
            raise
        except Exception as e:
            logger.error(f"[{self.name}] Unexpected error: {e}", exc_info=True)
            return '{"issues": []}'
    
    def _call_gemini(self, prompt: str, retry_count: int = 0) -> str:
        """
        Call Gemini API with automatic key rotation on rate limits.
        """
        import time
        from google.api_core import exceptions as google_exceptions
        
        max_rotation_attempts = len(self.gemini_api_keys) if hasattr(self, 'gemini_api_keys') else 1
        
        try:
            logger.info(f"[{self.name}] Calling Gemini API with model {self.model}")
            
            # Combine system prompt and user prompt for Gemini
            full_prompt = f"""{SYSTEM_PROMPT}

---

{prompt}

---

IMPORTANT: You must respond with ONLY valid JSON. No explanations, no markdown, just the JSON object.
The JSON must follow this exact structure:
{{
  "issues": [
    {{
      "line": <number>,
      "severity": "critical|major|minor|info",
      "issue": "description",
      "suggestion": "how to fix"
    }}
  ]
}}

If you find no issues, respond with: {{"issues": []}}
"""
            
            response = self.client.generate_content(full_prompt)
            
            if response and response.text:
                text = response.text.strip()
                logger.info(f"[{self.name}] Received response from Gemini ({len(text)} chars)")
                
                # Clean up markdown formatting
                if text.startswith("```json"):
                    text = text[7:]
                elif text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                
                cleaned_text = text.strip()
                logger.debug(f"[{self.name}] Cleaned response:\n{cleaned_text[:500]}...")
                
                return cleaned_text
            else:
                logger.warning(f"[{self.name}] Empty response from Gemini")
                return '{"issues": []}'
                
        except google_exceptions.ResourceExhausted as e:
            logger.warning(f"[{self.name}] Rate limit hit on API key #{self.current_key_index + 1}")
            
            if retry_count < max_rotation_attempts - 1:
                if self._rotate_gemini_key():
                    logger.info(f"[{self.name}] Retrying with rotated API key...")
                    time.sleep(1)
                    return self._call_gemini(prompt, retry_count + 1)
            
            logger.error(f"[{self.name}] All {max_rotation_attempts} API key(s) rate limited")
            return '{"issues": []}'
            
        except Exception as e:
            logger.error(f"[{self.name}] Gemini API error: {e}", exc_info=True)
            return '{"issues": []}'
    
    def _parse_llm_response(
        self, 
        response_text: str, 
        changes: List[ParsedChange], 
        file_path: str
    ) -> List[ReviewComment]:
        """
        Parse LLM JSON response into ReviewComment objects.
        """
        comments: List[ReviewComment] = []
        
        try:
            # Clean response
            cleaned = response_text.strip()
            
            # Remove markdown code blocks
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            # Log what we're trying to parse
            logger.debug(f"[{self.name}] Attempting to parse JSON:\n{cleaned[:300]}...")
            
            # Parse JSON
            data = json.loads(cleaned)
            issues = data.get("issues", [])
            
            if not isinstance(issues, list):
                logger.error(f"[{self.name}] 'issues' is not a list: {type(issues)}")
                return []
            
            logger.info(f"[{self.name}] Parsed {len(issues)} issues from response")
            
            for idx, issue in enumerate(issues):
                if not isinstance(issue, dict):
                    logger.warning(f"[{self.name}] Issue {idx} is not a dict: {type(issue)}")
                    continue
                
                line_no = issue.get("line", 0)
                severity = issue.get("severity", "info")
                issue_text = issue.get("issue", "")
                suggestion = issue.get("suggestion", "")
                
                # Validate severity
                if severity not in ["critical", "major", "minor", "info"]:
                    logger.warning(f"[{self.name}] Invalid severity '{severity}', defaulting to 'info'")
                    severity = "info"
                
                if not issue_text:
                    logger.warning(f"[{self.name}] Issue {idx} has no text, skipping")
                    continue
                
                logger.debug(f"[{self.name}] Adding comment: line={line_no}, severity={severity}, issue={issue_text[:50]}...")
                
                comments.append(
                    ReviewComment(
                        file=file_path,
                        line=line_no,
                        severity=severity,
                        agent=self.name,
                        comment=issue_text,
                        suggestion=suggestion
                    )
                )
        
        except json.JSONDecodeError as e:
            logger.error(f"[{self.name}] JSON decode error: {e}")
            logger.error(f"[{self.name}] Failed to parse: {response_text[:500]}")
        except Exception as e:
            logger.error(f"[{self.name}] Unexpected error parsing response: {e}", exc_info=True)
        
        logger.info(f"[{self.name}] Returning {len(comments)} comments")
        return comments