"""
Review data models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    """Base review model"""
    text: str = Field(..., description="Review text content")
    rating: str = Field(..., description="Review rating (e.g., '★★★☆☆ (3 stars)')")
    date: str = Field(..., description="Review date")
    source: Optional[str] = Field(None, description="Review source/platform")
    user_id: Optional[str] = Field(None, description="User identifier")


class ReviewCreate(ReviewBase):
    """Review creation model"""
    pass


class ReviewUpdate(BaseModel):
    """Review update model"""
    text: Optional[str] = None
    rating: Optional[str] = None
    date: Optional[str] = None
    source: Optional[str] = None
    user_id: Optional[str] = None


class Review(ReviewBase):
    """Complete review model"""
    id: Optional[str] = Field(None, description="Review ID")  # ✅ sirf id, no alias
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_analyzed: bool = Field(default=False, description="Whether review has been analyzed")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
        protected_namespaces = ()   # ✅ prevent conflicts


class ReviewResponse(Review):
    """Review response model"""
    pass
