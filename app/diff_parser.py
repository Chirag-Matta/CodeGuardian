from unidiff import PatchSet
from unidiff.errors import UnidiffParseError
from typing import List
from app.models import ReviewComment
import logging

logger = logging.getLogger(__name__)


class ParsedChange:
    def __init__(self, file_path: str, new_line_no: int, content: str):
        self.file_path = file_path
        self.new_line_no = new_line_no
        self.content = content


def parse_diff(diff_text: str) -> list[ParsedChange]:
    """
    Parse unified diff and return list of added/changed lines with file + line numbers.
    Handles malformed diffs gracefully.
    """
    if not diff_text or not diff_text.strip():
        logger.warning("Empty diff provided")
        return []
    
    # Try to fix common diff format issues
    diff_text = normalize_diff(diff_text)
    
    try:
        patch = PatchSet(diff_text)
        changes: list[ParsedChange] = []

        for patched_file in patch:
            file_path = patched_file.path  # new file path
            for hunk in patched_file:
                for line in hunk:
                    # We only care about added lines (can extend for removed/modified logic)
                    if line.is_added:
                        changes.append(
                            ParsedChange(
                                file_path=file_path,
                                new_line_no=line.target_line_no or 0,
                                content=str(line)[1:].rstrip("\n"),  # remove leading '+' and newline
                            )
                        )
        
        logger.info(f"Successfully parsed {len(changes)} changes from diff")
        return changes
        
    except UnidiffParseError as e:
        logger.error(f"Failed to parse diff: {e}")
        logger.debug(f"Problematic diff (first 500 chars): {diff_text[:500]}")
        
        # Fallback: try to extract added lines manually
        return parse_diff_fallback(diff_text)
    except Exception as e:
        logger.error(f"Unexpected error parsing diff: {e}")
        return parse_diff_fallback(diff_text)


def normalize_diff(diff_text: str) -> str:
    """
    Normalize diff format to fix common issues.
    """
    lines = diff_text.split('\n')
    normalized = []
    
    for line in lines:
        # Ensure diff header exists
        if line.startswith('diff --git'):
            normalized.append(line)
        # Ensure proper file markers
        elif line.startswith('---') or line.startswith('+++'):
            normalized.append(line)
        # Ensure hunk headers are properly formatted
        elif line.startswith('@@'):
            # Make sure hunk header has proper format
            if '@@' in line[2:]:
                normalized.append(line)
            else:
                # Try to fix malformed hunk header
                normalized.append(f"{line} @@")
        else:
            normalized.append(line)
    
    return '\n'.join(normalized)


def parse_diff_fallback(diff_text: str) -> list[ParsedChange]:
    """
    Fallback parser for when unidiff fails.
    Extracts added lines manually from diff text.
    """
    logger.warning("Using fallback diff parser")
    changes: list[ParsedChange] = []
    
    lines = diff_text.split('\n')
    current_file = None
    current_line_no = 0
    in_hunk = False
    
    for line in lines:
        # Extract file path
        if line.startswith('+++'):
            # Extract file path from +++ b/path/to/file
            parts = line.split()
            if len(parts) >= 2:
                file_path = parts[1]
                # Remove b/ prefix if present
                if file_path.startswith('b/'):
                    file_path = file_path[2:]
                current_file = file_path
                logger.debug(f"Fallback parser found file: {current_file}")
        
        # Extract line number from hunk header
        elif line.startswith('@@'):
            try:
                # Parse @@ -1,4 +1,5 @@ format
                parts = line.split()
                if len(parts) >= 3:
                    # Get new file line numbers from +start,count
                    new_lines = parts[2].replace('+', '')
                    if ',' in new_lines:
                        current_line_no = int(new_lines.split(',')[0])
                    else:
                        current_line_no = int(new_lines)
                    in_hunk = True
                    logger.debug(f"Fallback parser starting at line {current_line_no}")
            except (ValueError, IndexError) as e:
                logger.warning(f"Could not parse hunk header: {line} - {e}")
                current_line_no = 0
        
        # Extract added lines
        elif in_hunk and line.startswith('+') and not line.startswith('+++'):
            if current_file and current_line_no > 0:
                content = line[1:]  # Remove leading '+'
                changes.append(
                    ParsedChange(
                        file_path=current_file,
                        new_line_no=current_line_no,
                        content=content
                    )
                )
                logger.debug(f"Added change at {current_file}:{current_line_no}")
            current_line_no += 1
        
        # Track line numbers for context and removed lines
        elif in_hunk and (line.startswith(' ') or line.startswith('-')):
            if not line.startswith('-'):
                current_line_no += 1
    
    logger.info(f"Fallback parser extracted {len(changes)} changes")
    return changes