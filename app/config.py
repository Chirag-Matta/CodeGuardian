import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # GitHub Configuration
    GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")
    GITHUB_API_BASE: str = "https://api.github.com"
    
    # LLM Provider Selection
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")  # "openai" or "gemini"
    
    # OpenAI Configuration (optional)
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    OPENAI_BASE_URL: str | None = os.getenv("OPENAI_BASE_URL")
    
    # Gemini Configuration (Free!)
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GEMINI_API_KEYS: str | None = os.getenv("GEMINI_API_KEYS")  # Comma-separated for rotation
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
    
    def get_gemini_keys(self) -> list[str]:
        """Get list of Gemini API keys for rotation."""
        if self.GEMINI_API_KEYS:
            # Split comma-separated keys and strip whitespace
            keys = [key.strip() for key in self.GEMINI_API_KEYS.split(",") if key.strip()]
            return keys
        elif self.GEMINI_API_KEY:
            return [self.GEMINI_API_KEY]
        return []
    
    # LLM Settings
    MAX_TOKENS_PER_REQUEST: int = 4000
    LLM_TEMPERATURE: float = 0.0
    
    # Agent Configuration
    ENABLE_LOGIC_AGENT: bool = True
    ENABLE_SECURITY_AGENT: bool = True
    ENABLE_PERFORMANCE_AGENT: bool = True
    ENABLE_READABILITY_AGENT: bool = True
    ENABLE_CODE_QUALITY_AGENT: bool = True
    
    # Review Settings
    MIN_SEVERITY_LEVEL: str = "info"
    MAX_COMMENTS_PER_FILE: int = 20
    BATCH_SIZE: int = 10
    
    # Retry Configuration
    MAX_RETRIES: int = 3
    RETRY_DELAY: float = 1.0
    
    # Token Management
    MAX_CONTEXT_TOKENS: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

# Validation
def validate_settings():
    if settings.LLM_PROVIDER == "openai" and not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
    if settings.LLM_PROVIDER == "gemini":
        keys = settings.get_gemini_keys()
        if not keys:
            raise ValueError("GEMINI_API_KEY or GEMINI_API_KEYS is required when LLM_PROVIDER=gemini")

if os.getenv("VALIDATE_CONFIG", "false").lower() == "true":
    validate_settings()