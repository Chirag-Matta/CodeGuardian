import httpx
from typing import Any
from app.config import settings

class GitHubClient:
    def __init__(self, token: str | None = None):
        self.base_url = settings.GITHUB_API_BASE
        self.token = token or settings.GITHUB_TOKEN
        if not self.token:
            raise ValueError("GITHUB_TOKEN not set")

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github+json",
        }

    async def get_pr(self, owner: str, repo: str, pr_number: int) -> dict[str, Any]:
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self._headers())
            resp.raise_for_status()
            return resp.json()

    async def get_pr_files(self, owner: str, repo: str, pr_number: int) -> list[dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/files"
        files: list[dict[str, Any]] = []
        page = 1

        async with httpx.AsyncClient() as client:
            while True:
                params = {"page": page, "per_page": 100}
                resp = await client.get(url, headers=self._headers(), params=params)
                resp.raise_for_status()
                batch = resp.json()
                if not batch:
                    break
                files.extend(batch)
                page += 1
        return files

    async def get_pr_diff(self, owner: str, repo: str, pr_number: int) -> str:
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        headers = self._headers()
        headers["Accept"] = "application/vnd.github.v3.diff"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            return resp.text
