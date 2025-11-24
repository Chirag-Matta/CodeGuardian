# from typing import List
# from app.agents.base import BaseAgent
# from app.diff_parser import ParsedChange
# from app.models import ReviewComment

# class LogicAgent(BaseAgent):
#     name = "logic_agent"

#     def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
#         comments: List[ReviewComment] = []

#         for ch in changes:
#             line = ch.content.strip()

#             # naive example: suspicious == None / != None usage
#             # if "== None" in line or "!= None" in line:
#             #     comments.append(
#             #         ReviewComment(
#             #             file=ch.file_path,
#             #             line=ch.new_line_no,
#             #             severity="major",
#             #             agent=self.name,
#             #             comment="Comparison to None using ==/!= is not recommended.",
#             #             suggestion="Use 'is None' or 'is not None' for None comparison."
#             #         )
#             #     )

#             # naive potential bug: 'if a = b' in some langs (but not very accurate)
#             if "if " in line and "=" in line and "==" not in line and "!=" not in line and ":=" not in line:
#                 # extremely heuristic; you can skip if too aggressive
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="info",
#                         agent=self.name,
#                         comment="This if-statement contains assignment. Verify that this is intentional.",
#                         suggestion="Ensure you are using comparison (==) if that was the intention."
#                     )
#                 )

#         return comments

"""
Logic Agent - Detects logical bugs and potential errors.
"""
from app.agents.llm_base import LLMAgent


class LogicAgent(LLMAgent):
    name = "logic_agent"
    agent_type = "logic"