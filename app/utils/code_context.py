"""
Utilities for extracting code context and metadata.
"""
from pathlib import Path
from typing import List
from app.diff_parser import ParsedChange


def detect_language(file_path: str) -> str:
    """Detect programming language from file extension."""
    ext_map = {
        ".py": "python",
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".java": "java",
        ".go": "go",
        ".rb": "ruby",
        ".php": "php",
        ".c": "c",
        ".cpp": "cpp",
        ".cs": "csharp",
        ".rs": "rust",
        ".swift": "swift",
        ".kt": "kotlin",
    }
    suffix = Path(file_path).suffix.lower()
    return ext_map.get(suffix, "unknown")


def group_changes_by_file(changes: List[ParsedChange]) -> dict[str, List[ParsedChange]]:
    """Group changes by file path."""
    grouped = {}
    for change in changes:
        if change.file_path not in grouped:
            grouped[change.file_path] = []
        grouped[change.file_path].append(change)
    return grouped


def create_code_block(changes: List[ParsedChange]) -> str:
    """
    Create a formatted code block with line numbers.
    """
    lines = []
    for change in changes:
        lines.append(f"Line {change.new_line_no}: {change.content}")
    return "\n".join(lines)


def should_skip_file(file_path: str) -> bool:
    """
    Skip files that don't need review (e.g., lockfiles, generated files).
    """
    skip_patterns = [
        "package-lock.json",
        "yarn.lock",
        "Pipfile.lock",
        "poetry.lock",
        ".min.js",
        ".min.css",
        "dist/",
        "build/",
        "__pycache__/",
        ".pyc",
    ]
    
    return any(pattern in file_path for pattern in skip_patterns)