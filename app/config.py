import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")
    GITHUB_API_BASE: str = "https://api.github.com"

settings = Settings()
