"""Insight data models (fixed for Pydantic v2)
"""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId


class InsightBase(BaseModel):
    """Base insight model"""
    review_id: str = Field(..., description="ID of the review this insight belongs to")
    sentiment: str = Field(..., description="Overall sentiment (positive, negative, neutral)")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    topics: List[str] = Field(default_factory=list, description="Identified topics/categories")
    positive_aspects: List[str] = Field(default_factory=list, description="Positive aspects mentioned")
    negative_aspects: List[str] = Field(default_factory=list, description="Negative aspects mentioned")
    problems: List[str] = Field(default_factory=list, description="Problems identified")
    suggestions: List[str] = Field(default_factory=list, description="Suggested solutions")
    keywords: List[str] = Field(default_factory=list, description="Key terms extracted")
    summary: str = Field(..., description="AI-generated summary of the review")


class InsightCreate(InsightBase):
    """Insight creation model"""
    pass


class Insight(InsightBase):
    """Complete insight model"""
    id: Optional[str] = Field(None, description="Insight ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processing_time: float = Field(..., description="Time taken to process (seconds)")
    ai_model: str = Field(..., description="AI model used for analysis")

    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v: Any) -> Optional[str]:
        """Validate and convert ObjectId to string"""
        if v is None:
            return None
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")

    @field_validator('review_id', mode='before')
    @classmethod
    def validate_review_id(cls, v: Any) -> str:
        """Validate and convert review_id ObjectId to string"""
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            return v
        raise ValueError("Invalid review_id")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda v: v.isoformat()}
    )


class InsightResponse(Insight):
    """Insight response model"""
    pass


class BatchAnalysisRequest(BaseModel):
    """Batch analysis request model"""
    review_ids: List[str] = Field(..., description="List of review IDs to analyze")
    force_reanalysis: bool = Field(default=False, description="Force reanalysis of already analyzed reviews")


class BatchAnalysisResponse(BaseModel):
    """Batch analysis response model"""
    total_reviews: int = Field(..., description="Total number of reviews processed")
    successful_analyses: int = Field(..., description="Number of successful analyses")
    failed_analyses: int = Field(..., description="Number of failed analyses")
    processing_time: float = Field(..., description="Total processing time (seconds)")
    insights: List[InsightResponse] = Field(..., description="Generated insights")