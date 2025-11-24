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
        # ✅ FIX: Set temperature and max_tokens BEFORE initializing clients
        self.max_tokens = settings.MAX_TOKENS_PER_REQUEST
        self.temperature = settings.LLM_TEMPERATURE
        
        self.provider = settings.LLM_PROVIDER.lower()
        
        if self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError(f"{self.name} requires OPENAI_API_KEY when using OpenAI provider")
            
            # Initialize OpenAI client
            client_kwargs = {
                "api_key": settings.OPENAI_API_KEY
            }
            
            # Support for Azure OpenAI or custom endpoints
            if settings.OPENAI_BASE_URL:
                client_kwargs["base_url"] = settings.OPENAI_BASE_URL
            
            self.client = OpenAI(**client_kwargs)
            self.model = settings.OPENAI_MODEL
            
        elif self.provider == "gemini":
            # Get all available API keys
            self.gemini_api_keys = settings.get_gemini_keys()
            if not self.gemini_api_keys:
                raise ValueError(f"{self.name} requires GEMINI_API_KEY or GEMINI_API_KEYS when using Gemini provider")
            
            # Track current key index for rotation
            self.current_key_index = 0
            self.model = settings.GEMINI_MODEL
            
            # Initialize with first key
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
        
        # Move to next key
        self.current_key_index = (self.current_key_index + 1) % len(self.gemini_api_keys)
        next_key = self.gemini_api_keys[self.current_key_index]
        
        logger.info(f"[{self.name}] Rotating to API key #{self.current_key_index + 1}/{len(self.gemini_api_keys)}")
        
        # Reinitialize client with new key
        self._init_gemini_client(next_key)
        return True
    
    def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
        """
        Main review method - analyzes changes and returns comments.
        """
        if not changes:
            return []
        
        # Group changes by file for efficient batch processing
        grouped = group_changes_by_file(changes)
        all_comments: List[ReviewComment] = []
        
        for file_path, file_changes in grouped.items():
            # Skip files that don't need review
            if should_skip_file(file_path):
                logger.info(f"[{self.name}] Skipping {file_path}")
                continue
            
            # Process in batches to avoid token limits
            batch_size = settings.BATCH_SIZE
            for i in range(0, len(file_changes), batch_size):
                batch = file_changes[i:i + batch_size]
                
                try:
                    comments = self._analyze_batch(batch, file_path)
                    all_comments.extend(comments)
                except Exception as e:
                    logger.error(f"[{self.name}] Error analyzing {file_path}: {e}")
                    # Continue with other batches
                    continue
        
        logger.info(f"[{self.name}] Found {len(all_comments)} issues")
        return all_comments
    
    def _analyze_batch(self, changes: List[ParsedChange], file_path: str) -> List[ReviewComment]:
        """
        Analyze a batch of changes for a single file.
        """
        language = detect_language(file_path)
        code_block = create_code_block(changes)
        
        # Generate prompt
        prompt = get_analysis_prompt(self.agent_type, code_block, file_path, language)
        
        # Call LLM with retry logic
        response_text = self._call_llm(prompt)
        
        # Parse response
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
                response_format={"type": "json_object"}  # Enforce JSON output
            )
            
            # Extract text from response
            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content
                if content:
                    return content
                else:
                    logger.warning(f"[{self.name}] Empty response from LLM")
                    return '{"issues": []}'
            else:
                logger.warning(f"[{self.name}] No choices in response")
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
            logger.error(f"[{self.name}] Unexpected error: {e}")
            return '{"issues": []}'
    
    def _call_gemini(self, prompt: str, retry_count: int = 0) -> str:
        """
        Call Gemini API with automatic key rotation on rate limits.
        """
        import time
        from google.api_core import exceptions as google_exceptions
        
        max_rotation_attempts = len(self.gemini_api_keys) if hasattr(self, 'gemini_api_keys') else 1
        
        try:
            # Combine system prompt and user prompt for Gemini
            full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt}\n\nIMPORTANT: Respond ONLY with valid JSON in the format specified above."
            
            response = self.client.generate_content(full_prompt)
            
            if response and response.text:
                # Gemini might wrap JSON in markdown code blocks, clean it up
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                return text.strip()
            else:
                logger.warning(f"[{self.name}] Empty response from Gemini")
                return '{"issues": []}'
                
        except google_exceptions.ResourceExhausted as e:
            # Rate limit exceeded - try rotating to next API key
            logger.warning(f"[{self.name}] Rate limit hit on API key #{self.current_key_index + 1}")
            
            # Only retry if we haven't exhausted all keys
            if retry_count < max_rotation_attempts - 1:
                if self._rotate_gemini_key():
                    logger.info(f"[{self.name}] Retrying with rotated API key...")
                    time.sleep(1)  # Brief pause before retry
                    return self._call_gemini(prompt, retry_count + 1)
            
            # All keys exhausted or rotation failed
            logger.error(f"[{self.name}] All {max_rotation_attempts} API key(s) rate limited. Returning empty results.")
            return '{"issues": []}'
            
        except Exception as e:
            logger.error(f"[{self.name}] Gemini API error: {e}")
            # Return empty issues instead of crashing
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
            # Remove markdown code blocks if present (shouldn't happen with json_object mode)
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            # Parse JSON
            data = json.loads(cleaned)
            issues = data.get("issues", [])
            
            if not isinstance(issues, list):
                logger.error(f"[{self.name}] 'issues' is not a list: {type(issues)}")
                return []
            
            for issue in issues:
                if not isinstance(issue, dict):
                    continue
                
                line_no = issue.get("line", 0)
                severity = issue.get("severity", "info")
                issue_text = issue.get("issue", "")
                suggestion = issue.get("suggestion", "")
                
                # Validate severity
                if severity not in ["critical", "major", "minor", "info"]:
                    severity = "info"
                
                if not issue_text:
                    continue
                
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
            logger.error(f"[{self.name}] Failed to parse JSON: {e}")
            logger.debug(f"Raw response: {response_text[:500]}")
            # Return empty list instead of crashing
        except Exception as e:
            logger.error(f"[{self.name}] Unexpected error parsing response: {e}")
        
        return comments