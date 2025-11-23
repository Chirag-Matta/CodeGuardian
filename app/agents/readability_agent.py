from typing import List
from app.agents.base import BaseAgent
from app.diff_parser import ParsedChange
from app.models import ReviewComment

class ReadabilityAgent(BaseAgent):
    name = "readability_agent"

    def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
        comments: List[ReviewComment] = []

        for ch in changes:
            line = ch.content

            if "tmp" in line or "var" in line or "data" in line:
                comments.append(
                    ReviewComment(
                        file=ch.file_path,
                        line=ch.new_line_no,
                        severity="info",
                        agent=self.name,
                        comment="Variable names like 'tmp', 'var', 'data' are generic. Consider more descriptive names.",
                        suggestion="Rename variables to reflect their role (e.g., 'user_payload', 'order_list')."
                    )
                )

        return comments
