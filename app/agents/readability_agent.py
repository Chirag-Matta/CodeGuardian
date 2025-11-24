# from typing import List
# from app.agents.base import BaseAgent
# from app.diff_parser import ParsedChange
# from app.models import ReviewComment
# import re

# class ReadabilityAgent(BaseAgent):
#     name = "readability_agent"

#     def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
#         comments: List[ReviewComment] = []
        
#         for ch in changes:
#             # Match whole words only
#             bad_names = re.findall(r'\b(tmp|var|data)\s*=', ch.content)
#         if bad_names:
#             comments.append(
#                 ReviewComment(
#                     file=ch.file_path,
#                     line=ch.new_line_no,
#                     severity="info",
#                     agent=self.name,
#                     comment=f"Generic variable name '{bad_names[0]}' detected.",
#                     suggestion="Use descriptive names like 'user_data', 'config_dict'."
#                 )
#             )
#         return comments


"""
Readability Agent - Checks code readability and naming.
"""
from app.agents.llm_base import LLMAgent


class ReadabilityAgent(LLMAgent):
    name = "readability_agent"
    agent_type = "readability"