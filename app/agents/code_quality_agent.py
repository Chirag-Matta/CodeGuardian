# from typing import List
# from app.agents.base import BaseAgent
# from app.diff_parser import ParsedChange
# from app.models import ReviewComment

# class CodeQualityAgent(BaseAgent):
#     name = "code_quality_agent"

#     def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
#         comments: List[ReviewComment] = []

#         for ch in changes:
#             # Example: long lines
#             if len(ch.content) > 120:
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="minor",
#                         agent=self.name,
#                         comment="Line is quite long (>120 chars). Consider breaking it into smaller statements.",
#                         suggestion="Refactor the line into multiple statements or extract logic into helper functions."
#                     )
#                 )

#             # Example: debug prints
#             if "print(" in ch.content or "console.log(" in ch.content:
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="minor",
#                         agent=self.name,
#                         comment="Debug logging found. Consider removing or using a proper logger.",
#                         suggestion="Use a structured logger instead of direct print/console.log."
#                     )
#                 )

#         return comments

"""
Code Quality Agent - Checks best practices and code style.
"""
from app.agents.llm_base import LLMAgent


class CodeQualityAgent(LLMAgent):
    name = "code_quality_agent"
    agent_type = "code_quality"