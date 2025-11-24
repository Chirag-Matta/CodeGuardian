# from typing import List
# from app.diff_parser import parse_diff, ParsedChange
# from app.models import ReviewComment, ReadableReviewResponse, ReviewSummary
# from app.agents.code_quality_agent import CodeQualityAgent
# from app.agents.logic_agent import LogicAgent
# from app.agents.security_agent import SecurityAgent
# from app.agents.performance_agent import PerformanceAgent
# from app.agents.readability_agent import ReadabilityAgent
# from app.agents.base import BaseAgent
# import os
# import json
# from datetime import datetime

# def get_agents() -> List[BaseAgent]:
#     return [
#         CodeQualityAgent(),
#         LogicAgent(),
#         SecurityAgent(),
#         PerformanceAgent(),
#         ReadabilityAgent(),
#     ]

# def run_multi_agent_review(diff_text: str, pr_number: int | None = None) -> ReadableReviewResponse:

#     changes: List[ParsedChange] = parse_diff(diff_text)
#     agents = get_agents()

#     all_comments: List[ReviewComment] = []

#     # Round-robin over all agents
#     for agent in agents:
#         comments = agent.review(changes)
#         all_comments.extend(comments)

#     # Deduplicate comments (very naive: by file+line+comment text)
#     unique_map: dict[tuple[str, int, str], ReviewComment] = {}
#     for c in all_comments:
#         key = (c.file, c.line, c.comment)
#         if key not in unique_map:
#             unique_map[key] = c

#     unique_comments = list(unique_map.values())

#     # Summary
#     severity_counts = {"critical": 0, "major": 0, "minor": 0, "info": 0}
#     for c in unique_comments:
#         severity_counts[c.severity] += 1

#     total = len(unique_comments)
#     if total == 0:
#         msg = "No issues detected by automated review agents."
#     else:
#         msg = (
#             f"Found {total} potential issue(s): "
#             f"{severity_counts['critical']} critical, "
#             f"{severity_counts['major']} major, "
#             f"{severity_counts['minor']} minor, "
#             f"{severity_counts['info']} informational."
#         )

#     summary = ReviewSummary(
#         total_comments=total,
#         critical=severity_counts["critical"],
#         major=severity_counts["major"],
#         minor=severity_counts["minor"],
#         info=severity_counts["info"],
#         message=msg,
#     )

#     # return ReadableReviewResponse(summary=summary, comments=unique_comments)

#     # ----- Better Readability Formatting -----

#     # Structure:
#     # files = { file_path: { severity: [ {..comment..}, ... ] } }
#     files: dict[str, dict[str, list[ReviewComment]]] = {}

#     for c in unique_comments:
#         if c.file not in files:
#             files[c.file] = {}
#         if c.severity not in files[c.file]:
#             files[c.file][c.severity] = []
#         files[c.file][c.severity].append(c)

#     # Deduplicate repeated messages: merge lines for same comment text
#     cleaned_files = {}

#     for file_path, severity_map in files.items():
#         cleaned_files[file_path] = {}
#         for severity, comments in severity_map.items():
#             merged: dict[str, dict] = {}

#             for c in comments:
#                 key = f"{c.agent}:{c.comment}"
#                 if key not in merged:
#                     merged[key] = {
#                         "agent": c.agent,
#                         "comment": c.comment,
#                         "suggestion": c.suggestion,
#                         "lines": [c.line],
#                     }
#                 else:
#                     merged[key]["lines"].append(c.line)

#             cleaned_files[file_path][severity] = list(merged.values())

#     final_response = ReadableReviewResponse(
#         summary=summary,
#         files=cleaned_files
#     )

#     # Save readable output to JSON file
#     save_review_to_file(
#         review_data=final_response.model_dump(),
#         pr_number=pr_number  # Use the function parameter directly
#     )

#     return final_response



# def save_review_to_file(review_data: dict, pr_number: int | None = None):
#     os.makedirs("output", exist_ok=True)

#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     if pr_number:
#         filename = f"output/pr_{pr_number}_review_{timestamp}.json"
#     else:
#         filename = f"output/diff_review_{timestamp}.json"

#     with open(filename, "w") as f:
#         json.dump(review_data, f, indent=4)

#     print(f"[SAVED] Review JSON saved to {filename}")


from typing import List
from app.diff_parser import parse_diff, ParsedChange
from app.models import ReviewComment, ReadableReviewResponse, ReviewSummary
from app.agents.code_quality_agent import CodeQualityAgent
from app.agents.logic_agent import LogicAgent
from app.agents.security_agent import SecurityAgent
from app.agents.performance_agent import PerformanceAgent
from app.agents.readability_agent import ReadabilityAgent
from app.agents.base import BaseAgent
from app.config import settings
import os
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def get_agents() -> List[BaseAgent]:
    """
    Return enabled agents based on configuration.
    """
    agents = []
    
    if settings.ENABLE_CODE_QUALITY_AGENT:
        agents.append(CodeQualityAgent())
    if settings.ENABLE_LOGIC_AGENT:
        agents.append(LogicAgent())
    if settings.ENABLE_SECURITY_AGENT:
        agents.append(SecurityAgent())
    if settings.ENABLE_PERFORMANCE_AGENT:
        agents.append(PerformanceAgent())
    if settings.ENABLE_READABILITY_AGENT:
        agents.append(ReadabilityAgent())
    
    return agents


def run_multi_agent_review(diff_text: str, pr_number: int | None = None) -> ReadableReviewResponse:
    """
    Run all enabled agents on the diff and return structured review.
    """
    logger.info(f"Starting review for PR #{pr_number if pr_number else 'manual diff'}")
    
    # Parse diff
    changes: List[ParsedChange] = parse_diff(diff_text)
    logger.info(f"Parsed {len(changes)} code changes")
    
    if not changes:
        return _empty_review("No code changes detected in diff")
    
    # Get enabled agents
    agents = get_agents()
    if not agents:
        return _empty_review("No review agents enabled")
    
    logger.info(f"Running {len(agents)} agents: {[a.name for a in agents]}")
    
    # Run all agents sequentially
    all_comments: List[ReviewComment] = []
    for agent in agents:
        try:
            comments = agent.review(changes)
            all_comments.extend(comments)
            logger.info(f"[{agent.name}] Generated {len(comments)} comments")
        except Exception as e:
            logger.error(f"[{agent.name}] Failed: {e}")
            # Continue with other agents
            continue
    
    # Deduplicate comments (by file + line + comment text)
    unique_map: dict[tuple[str, int, str], ReviewComment] = {}
    for c in all_comments:
        key = (c.file, c.line, c.comment)
        if key not in unique_map:
            unique_map[key] = c
    
    unique_comments = list(unique_map.values())
    logger.info(f"After deduplication: {len(unique_comments)} unique comments")
    
    # Filter by severity if configured
    if settings.MIN_SEVERITY_LEVEL != "info":
        severity_order = {"critical": 0, "major": 1, "minor": 2, "info": 3}
        min_level = severity_order.get(settings.MIN_SEVERITY_LEVEL, 3)
        unique_comments = [
            c for c in unique_comments 
            if severity_order.get(c.severity, 3) <= min_level
        ]
    
    # Build summary
    severity_counts = {"critical": 0, "major": 0, "minor": 0, "info": 0}
    for c in unique_comments:
        severity_counts[c.severity] += 1
    
    total = len(unique_comments)
    if total == 0:
        msg = "✅ No issues detected by automated review agents."
    else:
        msg = (
            f"Found {total} potential issue(s): "
            f"{severity_counts['critical']} critical, "
            f"{severity_counts['major']} major, "
            f"{severity_counts['minor']} minor, "
            f"{severity_counts['info']} informational."
        )
    
    summary = ReviewSummary(
        total_comments=total,
        critical=severity_counts["critical"],
        major=severity_counts["major"],
        minor=severity_counts["minor"],
        info=severity_counts["info"],
        message=msg,
    )
    
    # Structure by file → severity → comments
    files: dict[str, dict[str, list[ReviewComment]]] = {}
    
    for c in unique_comments:
        if c.file not in files:
            files[c.file] = {}
        if c.severity not in files[c.file]:
            files[c.file][c.severity] = []
        files[c.file][c.severity].append(c)
    
    # Merge duplicate comments on same line
    cleaned_files = {}
    for file_path, severity_map in files.items():
        cleaned_files[file_path] = {}
        for severity, comments in severity_map.items():
            merged: dict[str, dict] = {}
            
            for c in comments:
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
    
    final_response = ReadableReviewResponse(
        summary=summary,
        files=cleaned_files
    )
    
    # Save to file
    save_review_to_file(
        review_data=final_response.model_dump(),
        pr_number=pr_number  # ✅ FIXED: Use parameter directly
    )
    
    return final_response


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


def save_review_to_file(review_data: dict, pr_number: int | None = None):
    """Save review results to JSON file."""
    os.makedirs("output", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if pr_number:
        filename = f"output/pr_{pr_number}_review_{timestamp}.json"
    else:
        filename = f"output/diff_review_{timestamp}.json"
    
    with open(filename, "w") as f:
        json.dump(review_data, f, indent=2)
    
    logger.info(f"Review saved to {filename}")