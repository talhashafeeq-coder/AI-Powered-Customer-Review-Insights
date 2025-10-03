"""
Configuration settings for the application
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    app_name: str = "AI-Powered Customer Review Insights"
    debug: bool = False
    
    # Database Settings
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name: str = os.getenv("DATABASE_NAME", "review_insights")
    
    # Groq Settings
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    
    # CORS Settings
    allowed_origins: list = ["*"]
    
    # Rate Limiting
    max_requests_per_minute: int = 60
    
    # Pydantic v2 settings configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"  # Ignore unknown env vars to prevent crashes
    )

# Global settings instance
settings = Settings()
