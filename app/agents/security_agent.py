# from typing import List
# from app.agents.base import BaseAgent
# from app.diff_parser import ParsedChange
# from app.models import ReviewComment

# class SecurityAgent(BaseAgent):
#     name = "security_agent"

#     def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
#         comments: List[ReviewComment] = []

#         for ch in changes:
#             line = ch.content

#             # naive secret detection
#             if "AWS_SECRET" in line or "PRIVATE_KEY" in line or "SECRET_KEY" in line:
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="critical",
#                         agent=self.name,
#                         comment="Potential secret or private key detected in code.",
#                         suggestion="Remove the secret from code and use environment variables or a secret manager."
#                     )
#                 )

#             # naive SQL injection risk
#             if ("SELECT" in line or "INSERT" in line or "UPDATE" in line) and ("+" in line or "f\"" in line):
#                 comments.append(
#                     ReviewComment(
#                         file=ch.file_path,
#                         line=ch.new_line_no,
#                         severity="major",
#                         agent=self.name,
#                         comment="Possible string concatenation in SQL query. This can lead to SQL injection.",
#                         suggestion="Use parameterized queries or ORM query builders instead of string concatenation."
#                     )
#                 )

#         return comments


"""
Security Agent - Identifies security vulnerabilities.
"""
from app.agents.llm_base import LLMAgent


class SecurityAgent(LLMAgent):
    name = "security_agent"
    agent_type = "security"