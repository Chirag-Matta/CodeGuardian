from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from app.models import (
    PRReviewRequest,
    DiffReviewRequest,
    ReadableReviewResponse,
    ErrorResponse,
)
from app.github_client import GitHubClient
from app.orchestrator import run_multi_agent_review

app = FastAPI(
    title="Automated GitHub PR Review Agent",
    version="1.0.0",
    description="Backend service to analyze GitHub Pull Requests using a multi-agent review system.",
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post(
    "/review-diff",
    response_model=ReadableReviewResponse,
    responses={400: {"model": ErrorResponse}},
)
async def review_diff(payload: DiffReviewRequest):
    if not payload.diff.strip():
        raise HTTPException(status_code=400, detail="Diff is empty")

    review = run_multi_agent_review(payload.diff)
    return review

@app.post(
    "/review-pr",
    response_model=ReadableReviewResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def review_pr(payload: PRReviewRequest):
    try:
        client = GitHubClient()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        # Optional: fetch PR metadata for logging or future extensions
        _pr = await client.get_pr(payload.owner, payload.repo, payload.pr_number)
        diff_text = await client.get_pr_diff(payload.owner, payload.repo, payload.pr_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch PR: {e}")

    if not diff_text.strip():
        raise HTTPException(status_code=400, detail="PR diff is empty")

    review = run_multi_agent_review(diff_text, payload.pr_number)

    return review
