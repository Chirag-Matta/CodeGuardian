# app/models.py - Add agents field
from pydantic import BaseModel, HttpUrl
from typing import List, Literal, Optional

Severity = Literal["critical", "major", "minor", "info"]

class PRReviewRequest(BaseModel):
    owner: str
    repo: str
    pr_number: int
    agents: Optional[List[str]] = None  # NEW: Optional list of agent names

class DiffReviewRequest(BaseModel):
    diff: str
    agents: Optional[List[str]] = None  # NEW: Optional list of agent names

class ReviewComment(BaseModel):
    file: str
    line: int
    severity: Severity
    agent: str
    comment: str
    suggestion: Optional[str] = None

class ReviewSummary(BaseModel):
    total_comments: int
    critical: int
    major: int
    minor: int
    info: int
    message: str

class ErrorResponse(BaseModel):
    detail: str

class PRUrlRequest(BaseModel):
    url: HttpUrl

class ReadableAgentComment(BaseModel):
    agent: str
    comment: str
    suggestion: Optional[str]
    lines: List[int]

class ReadableReviewResponse(BaseModel):
    summary: ReviewSummary
    files: dict[str, dict[str, List[ReadableAgentComment]]]