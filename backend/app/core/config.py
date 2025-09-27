"""
Configuration settings for the application
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    app_name: str = "AI-Powered Customer Review Insights"
    debug: bool = False
    
    # Database Settings
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name: str = os.getenv("DATABASE_NAME", "review_insights")
    
    # OpenAI Settings
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "llama-3.1-8b-instant")
    
    # CORS Settings
    allowed_origins: list = ["*"]
    
    # Rate Limiting
    max_requests_per_minute: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
