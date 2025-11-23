from typing import List
from app.diff_parser import parse_diff, ParsedChange
from app.models import ReviewComment, ReadableReviewResponse, ReviewSummary
from app.agents.code_quality_agent import CodeQualityAgent
from app.agents.logic_agent import LogicAgent
from app.agents.security_agent import SecurityAgent
from app.agents.performance_agent import PerformanceAgent
from app.agents.readability_agent import ReadabilityAgent
from app.agents.base import BaseAgent
import os
import json
from datetime import datetime

def get_agents() -> List[BaseAgent]:
    return [
        CodeQualityAgent(),
        LogicAgent(),
        SecurityAgent(),
        PerformanceAgent(),
        ReadabilityAgent(),
    ]

def run_multi_agent_review(diff_text: str, pr_number: int | None = None) -> ReadableReviewResponse:

    changes: List[ParsedChange] = parse_diff(diff_text)
    agents = get_agents()

    all_comments: List[ReviewComment] = []

    # Round-robin over all agents
    for agent in agents:
        comments = agent.review(changes)
        all_comments.extend(comments)

    # Deduplicate comments (very naive: by file+line+comment text)
    unique_map: dict[tuple[str, int, str], ReviewComment] = {}
    for c in all_comments:
        key = (c.file, c.line, c.comment)
        if key not in unique_map:
            unique_map[key] = c

    unique_comments = list(unique_map.values())

    # Summary
    severity_counts = {"critical": 0, "major": 0, "minor": 0, "info": 0}
    for c in unique_comments:
        severity_counts[c.severity] += 1

    total = len(unique_comments)
    if total == 0:
        msg = "No issues detected by automated review agents."
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

    # return ReadableReviewResponse(summary=summary, comments=unique_comments)

    # ----- Better Readability Formatting -----

    # Structure:
    # files = { file_path: { severity: [ {..comment..}, ... ] } }
    files: dict[str, dict[str, list[ReviewComment]]] = {}

    for c in unique_comments:
        if c.file not in files:
            files[c.file] = {}
        if c.severity not in files[c.file]:
            files[c.file][c.severity] = []
        files[c.file][c.severity].append(c)

    # Deduplicate repeated messages: merge lines for same comment text
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
                    merged[key]["lines"].append(c.line)

            cleaned_files[file_path][severity] = list(merged.values())

    final_response = ReadableReviewResponse(
        summary=summary,
        files=cleaned_files
    )

    # Save readable output to JSON file
    save_review_to_file(
        review_data=final_response.model_dump(),
        pr_number=review_pr_number if 'review_pr_number' in locals() else None
    )

    return final_response



def save_review_to_file(review_data: dict, pr_number: int | None = None):
    os.makedirs("output", exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if pr_number:
        filename = f"output/pr_{pr_number}_review_{timestamp}.json"
    else:
        filename = f"output/diff_review_{timestamp}.json"

    with open(filename, "w") as f:
        json.dump(review_data, f, indent=4)

    print(f"[SAVED] Review JSON saved to {filename}")
