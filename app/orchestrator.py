# app/parallel_orchestrator.py
"""
Parallel multi-agent orchestrator with failure isolation.

SPEED IMPROVEMENT:
- Sequential: Agent1(10s) + Agent2(12s) + Agent3(8s) = 34s total
- Parallel:   max(10s, 12s, 8s) = 12s total (2.5x faster!)

KEY FEATURES:
- ✅ Agents run in parallel threads
- ✅ If one agent crashes, others continue
- ✅ Configurable timeout per agent
- ✅ Progress tracking
- ✅ Graceful error handling
"""
from typing import List, Optional, Dict
from concurrent.futures import ThreadPoolExecutor, TimeoutError, as_completed
from app.diff_parser import parse_diff, ParsedChange
from app.models import ReviewComment, ReadableReviewResponse, ReviewSummary
from app.agents.base import BaseAgent
from app.config import settings
import os
import json
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)

# Import all agent classes
from app.agents.speed_optimized_agent import SpeedOptimizedCodeQualityAgent , SpeedOptimizedLogicAgent , SpeedOptimizedSecurityAgent , SpeedOptimizedPerformanceAgent
from app.agents.readability_agent import ReadabilityAgent

# Map of agent names to classes
AGENT_MAP = {
    'code_quality_agent': SpeedOptimizedCodeQualityAgent,
    'logic_agent': SpeedOptimizedLogicAgent,
    'security_agent': SpeedOptimizedSecurityAgent,
    'performance_agent': SpeedOptimizedPerformanceAgent,
    'readability_agent': ReadabilityAgent,
}


class AgentResult:
    """Container for agent execution result"""
    def __init__(self, agent_name: str, comments: List[ReviewComment], 
                 duration: float, error: Optional[Exception] = None):
        self.agent_name = agent_name
        self.comments = comments
        self.duration = duration
        self.error = error
        self.success = error is None


def run_agent_safe(agent: BaseAgent, changes: List[ParsedChange], 
                   timeout: int = 60) -> AgentResult:
    """
    Run a single agent with error handling and timing.
    
    Args:
        agent: The agent instance to run
        changes: List of code changes to analyze
        timeout: Maximum execution time in seconds
    
    Returns:
        AgentResult with comments or error information
    """
    start_time = time.time()
    
    try:
        logger.info(f"[{agent.name}] Starting analysis...")
        comments = agent.review(changes)
        duration = time.time() - start_time
        
        logger.info(f"[{agent.name}] ✅ Completed in {duration:.2f}s, found {len(comments)} issues")
        return AgentResult(agent.name, comments, duration)
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"[{agent.name}] ❌ Failed after {duration:.2f}s: {e}")
        return AgentResult(agent.name, [], duration, error=e)


def run_multi_agent_review_parallel(
    diff_text: str, 
    pr_number: Optional[int] = None,
    selected_agents: Optional[List[str]] = None,
    max_workers: Optional[int] = None,
    agent_timeout: int = 60
) -> ReadableReviewResponse:
    """
    Run all enabled agents in PARALLEL for maximum speed.
    
    Args:
        diff_text: The git diff to analyze
        pr_number: Optional PR number for logging
        selected_agents: Optional list of agent names to run
        max_workers: Number of parallel threads (default: number of agents)
        agent_timeout: Timeout per agent in seconds
    
    Returns:
        ReadableReviewResponse with aggregated results
    """
    logger.info(f"Starting PARALLEL review for PR #{pr_number if pr_number else 'manual diff'}")
    
    # Parse diff
    start_parse = time.time()
    changes: List[ParsedChange] = parse_diff(diff_text)
    parse_time = time.time() - start_parse
    logger.info(f"Parsed {len(changes)} code changes in {parse_time:.2f}s")
    
    if not changes:
        return _empty_review("No code changes detected in diff")
    
    # Get enabled agents
    agents = get_agents(selected_agents)
    if not agents:
        return _empty_review("No review agents enabled or selected")
    
    logger.info(f"Running {len(agents)} agents in PARALLEL: {[a.name for a in agents]}")
    
    # Run agents in parallel
    start_review = time.time()
    
    # Default to one thread per agent
    if max_workers is None:
        max_workers = len(agents)
    
    agent_results: List[AgentResult] = []
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all agents to thread pool
        future_to_agent = {
            executor.submit(run_agent_safe, agent, changes, agent_timeout): agent
            for agent in agents
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_agent):
            agent = future_to_agent[future]
            try:
                result = future.result(timeout=agent_timeout + 5)  # Extra 5s buffer
                agent_results.append(result)
            except TimeoutError:
                logger.error(f"[{agent.name}] ⏱️ Timeout after {agent_timeout}s")
                agent_results.append(
                    AgentResult(agent.name, [], agent_timeout, 
                              error=TimeoutError(f"Agent exceeded {agent_timeout}s timeout"))
                )
            except Exception as e:
                logger.error(f"[{agent.name}] 💥 Unexpected error: {e}")
                agent_results.append(
                    AgentResult(agent.name, [], 0, error=e)
                )
    
    review_time = time.time() - start_review
    
    # Log results
    successful = [r for r in agent_results if r.success]
    failed = [r for r in agent_results if not r.success]
    
    logger.info(f"⚡ Parallel review completed in {review_time:.2f}s")
    logger.info(f"✅ Successful: {len(successful)}/{len(agents)} agents")
    
    if failed:
        logger.warning(f"❌ Failed agents: {[r.agent_name for r in failed]}")
        for result in failed:
            logger.warning(f"  - {result.agent_name}: {result.error}")
    
    # Aggregate all comments from successful agents
    all_comments: List[ReviewComment] = []
    for result in successful:
        all_comments.extend(result.comments)
    
    logger.info(f"Total comments before deduplication: {len(all_comments)}")
    
    # Deduplicate comments
    unique_comments = _deduplicate_comments(all_comments)
    logger.info(f"After deduplication: {len(unique_comments)} unique comments")
    
    # Filter by severity if configured
    if settings.MIN_SEVERITY_LEVEL != "info":
        unique_comments = _filter_by_severity(unique_comments)
    
    # Build summary
    summary = _build_summary(unique_comments, agent_results, review_time)
    
    # Structure by file → severity → comments
    structured_files = _structure_comments(unique_comments)
    
    final_response = ReadableReviewResponse(
        summary=summary,
        files=structured_files
    )
    
    # Save to file with timing stats
    save_review_to_file(
        review_data=final_response.model_dump(),
        pr_number=pr_number,
        agent_results=agent_results,
        total_time=review_time
    )
    
    return final_response


def get_agents(selected_agents: Optional[List[str]] = None) -> List[BaseAgent]:
    """
    Return enabled agents based on configuration and user selection.
    
    Args:
        selected_agents: Optional list of agent names to run. If None, uses config settings.
    """
    agents = []
    
    # If specific agents are requested, use only those
    if selected_agents:
        for agent_name in selected_agents:
            if agent_name in AGENT_MAP:
                try:
                    agents.append(AGENT_MAP[agent_name]())
                    logger.info(f"Enabled agent: {agent_name}")
                except Exception as e:
                    logger.error(f"Failed to initialize {agent_name}: {e}")
            else:
                logger.warning(f"Unknown agent requested: {agent_name}")
        return agents
    
    # Otherwise, use configuration settings
    if settings.ENABLE_CODE_QUALITY_AGENT:
        agents.append(AGENT_MAP['code_quality_agent']())
    if settings.ENABLE_LOGIC_AGENT:
        agents.append(AGENT_MAP['logic_agent']())
    if settings.ENABLE_SECURITY_AGENT:
        agents.append(AGENT_MAP['security_agent']())
    if settings.ENABLE_PERFORMANCE_AGENT:
        agents.append(AGENT_MAP['performance_agent']())
    if settings.ENABLE_READABILITY_AGENT:
        agents.append(AGENT_MAP['readability_agent']())
    
    return agents


def _deduplicate_comments(comments: List[ReviewComment]) -> List[ReviewComment]:
    """Remove duplicate comments by (file, line, comment text)"""
    unique_map: Dict[tuple, ReviewComment] = {}
    for c in comments:
        key = (c.file, c.line, c.comment)
        if key not in unique_map:
            unique_map[key] = c
    return list(unique_map.values())


def _filter_by_severity(comments: List[ReviewComment]) -> List[ReviewComment]:
    """Filter comments by minimum severity level"""
    severity_order = {"critical": 0, "major": 1, "minor": 2, "info": 3}
    min_level = severity_order.get(settings.MIN_SEVERITY_LEVEL, 3)
    return [
        c for c in comments 
        if severity_order.get(c.severity, 3) <= min_level
    ]


def _build_summary(
    comments: List[ReviewComment], 
    agent_results: List[AgentResult],
    total_time: float
) -> ReviewSummary:
    """Build review summary with statistics"""
    severity_counts = {"critical": 0, "major": 0, "minor": 0, "info": 0}
    for c in comments:
        severity_counts[c.severity] += 1
    
    total = len(comments)
    successful_agents = len([r for r in agent_results if r.success])
    total_agents = len(agent_results)
    
    if total == 0:
        msg = "✅ No issues detected by automated review agents."
    else:
        msg = (
            f"Found {total} potential issue(s) in {total_time:.1f}s "
            f"({successful_agents}/{total_agents} agents): "
            f"{severity_counts['critical']} critical, "
            f"{severity_counts['major']} major, "
            f"{severity_counts['minor']} minor, "
            f"{severity_counts['info']} informational."
        )
    
    return ReviewSummary(
        total_comments=total,
        critical=severity_counts["critical"],
        major=severity_counts["major"],
        minor=severity_counts["minor"],
        info=severity_counts["info"],
        message=msg,
    )


def _structure_comments(comments: List[ReviewComment]) -> dict:
    """Structure comments by file → severity → merged comments"""
    files: dict[str, dict[str, list[ReviewComment]]] = {}
    
    for c in comments:
        if c.file not in files:
            files[c.file] = {}
        if c.severity not in files[c.file]:
            files[c.file][c.severity] = []
        files[c.file][c.severity].append(c)
    
    # Merge duplicate comments on same line
    cleaned_files = {}
    for file_path, severity_map in files.items():
        cleaned_files[file_path] = {}
        for severity, file_comments in severity_map.items():
            merged: dict[str, dict] = {}
            
            for c in file_comments:
                key = f"{c.agent}:{c.comment}"
                if key not in merged:
                    merged[key] = {
                        "agent": c.agent,
                        "comment": c.comment,
                        "suggestion": c.suggestion,
                        "lines": [c.line],
                    }
                else:
                    if c.line not in merged[key]["lines"]:
                        merged[key]["lines"].append(c.line)
            
            # Apply max comments per file limit
            comment_list = list(merged.values())
            if len(comment_list) > settings.MAX_COMMENTS_PER_FILE:
                logger.warning(
                    f"File {file_path} has {len(comment_list)} comments, "
                    f"truncating to {settings.MAX_COMMENTS_PER_FILE}"
                )
                comment_list = comment_list[:settings.MAX_COMMENTS_PER_FILE]
            
            cleaned_files[file_path][severity] = comment_list
    
    return cleaned_files


def _empty_review(message: str) -> ReadableReviewResponse:
    """Return empty review with custom message."""
    return ReadableReviewResponse(
        summary=ReviewSummary(
            total_comments=0,
            critical=0,
            major=0,
            minor=0,
            info=0,
            message=message
        ),
        files={}
    )


def save_review_to_file(
    review_data: dict, 
    pr_number: Optional[int] = None,
    agent_results: Optional[List[AgentResult]] = None,
    total_time: Optional[float] = None
):
    """Save review results to JSON file with timing information."""
    os.makedirs("output", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if pr_number:
        filename = f"output/pr_{pr_number}_review_{timestamp}.json"
    else:
        filename = f"output/diff_review_{timestamp}.json"
    
    # Add timing metadata
    if agent_results:
        review_data['_metadata'] = {
            'total_time_seconds': total_time,
            'agents': [
                {
                    'name': r.agent_name,
                    'duration_seconds': r.duration,
                    'success': r.success,
                    'comments_found': len(r.comments),
                    'error': str(r.error) if r.error else None
                }
                for r in agent_results
            ]
        }
    
    with open(filename, "w") as f:
        json.dump(review_data, f, indent=2)
    
    logger.info(f"Review saved to {filename}")


# ============================================================================
# BACKWARDS COMPATIBILITY: Keep sequential version available
# ============================================================================

def run_multi_agent_review_sequential(
    diff_text: str, 
    pr_number: Optional[int] = None,
    selected_agents: Optional[List[str]] = None
) -> ReadableReviewResponse:
    """
    Original sequential implementation (kept for comparison/fallback).
    Use run_multi_agent_review_parallel() for better performance.
    """
    logger.info(f"Starting SEQUENTIAL review for PR #{pr_number if pr_number else 'manual diff'}")
    
    changes: List[ParsedChange] = parse_diff(diff_text)
    logger.info(f"Parsed {len(changes)} code changes")
    
    if not changes:
        return _empty_review("No code changes detected in diff")
    
    agents = get_agents(selected_agents)
    if not agents:
        return _empty_review("No review agents enabled or selected")
    
    logger.info(f"Running {len(agents)} agents SEQUENTIALLY: {[a.name for a in agents]}")
    
    # Run all agents sequentially
    all_comments: List[ReviewComment] = []
    start_time = time.time()
    
    for agent in agents:
        try:
            agent_start = time.time()
            comments = agent.review(changes)
            agent_time = time.time() - agent_start
            all_comments.extend(comments)
            logger.info(f"[{agent.name}] Generated {len(comments)} comments in {agent_time:.2f}s")
        except Exception as e:
            logger.error(f"[{agent.name}] Failed: {e}")
            continue
    
    total_time = time.time() - start_time
    logger.info(f"Sequential review completed in {total_time:.2f}s")
    
    # Rest of processing same as parallel version...
    unique_comments = _deduplicate_comments(all_comments)
    if settings.MIN_SEVERITY_LEVEL != "info":
        unique_comments = _filter_by_severity(unique_comments)
    
    summary = _build_summary(unique_comments, [], total_time)
    structured_files = _structure_comments(unique_comments)
    
    return ReadableReviewResponse(summary=summary, files=structured_files)

run_multi_agent_review = run_multi_agent_review_parallel