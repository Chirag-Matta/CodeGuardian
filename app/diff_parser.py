from unidiff import PatchSet
from typing import List
from app.models import ReviewComment

class ParsedChange:
    def __init__(self, file_path: str, new_line_no: int, content: str):
        self.file_path = file_path
        self.new_line_no = new_line_no
        self.content = content

def parse_diff(diff_text: str) -> list[ParsedChange]:
    """
    Parse unified diff and return list of added/changed lines with file + line numbers.
    """
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
    return changes
