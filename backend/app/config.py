"""
ChronoFlow Backend Configuration
"""
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "ChronoFlow"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api"

    # Security
    SECRET_KEY: str = "change-this-in-production-use-openssl-rand-hex-32"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "mysql+pymysql://chronoflow:chronoflow_password@localhost:3306/chronoflow"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:8000"

    # AI Configuration (Cloud mode - centralized management)
    AI_PROVIDER: str = "deepseek"  # deepseek, openai, google
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "deepseek-chat"
    AI_BASE_URL: Optional[str] = None  # For custom endpoints

    # Optional fallback AI provider
    AI_FALLBACK_PROVIDER: Optional[str] = None
    AI_FALLBACK_API_KEY: Optional[str] = None
    AI_FALLBACK_MODEL: Optional[str] = None

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
