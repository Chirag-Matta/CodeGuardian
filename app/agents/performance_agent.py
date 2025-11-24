# from typing import List
# from app.agents.base import BaseAgent
# from app.diff_parser import ParsedChange
# from app.models import ReviewComment

# class PerformanceAgent(BaseAgent):
#     name = "performance_agent"

#     def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
#         comments: List[ReviewComment] = []

#         for ch in changes:
#             line = ch.content.strip()

#             # naive: nested loops in one line
#             if "for " in line and "in " in line and "for " in line[line.find("for ") + 1:]:
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="info",
#                         agent=self.name,
#                         comment="Nested loops detected in a single line. Ensure this is not a performance hotspot.",
#                         suggestion="If this runs on large datasets, consider optimizing or breaking up the logic."
#                     )
#                 )

#             # naive: list inside loop for DB
#             if "for " in line and ("db." in line or "session." in line):
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="major",
#                         agent=self.name,
#                         comment="Loop appears to make DB calls. This can cause N+1 query issues.",
#                         suggestion="Batch queries or use eager loading to reduce the number of DB calls."
#                     )
#                 )
#         return comments


"""
Performance Agent - Flags performance issues.
"""
from app.agents.llm_base import LLMAgent


class PerformanceAgent(LLMAgent):
    name = "performance_agent"
    agent_type = "performance"