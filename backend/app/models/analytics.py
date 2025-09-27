"""
Analytics data models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.insight import InsightResponse 

class SentimentDistribution(BaseModel):
    """Sentiment distribution model"""
    positive: int = Field(..., description="Number of positive reviews")
    negative: int = Field(..., description="Number of negative reviews")
    neutral: int = Field(..., description="Number of neutral reviews")
    total: int = Field(..., description="Total number of reviews")

class TopicFrequency(BaseModel):
    """Topic frequency model"""
    topic: str = Field(..., description="Topic name")
    count: int = Field(..., description="Number of mentions")
    percentage: float = Field(..., description="Percentage of total mentions")

class TrendData(BaseModel):
    """Trend data model"""
    date: str = Field(..., description="Date")
    sentiment_score: float = Field(..., description="Average sentiment score")
    review_count: int = Field(..., description="Number of reviews")

class AnalyticsSummary(BaseModel):
    """Analytics summary model"""
    total_reviews: int = Field(..., description="Total number of reviews")
    analyzed_reviews: int = Field(..., description="Number of analyzed reviews")
    insights: List[InsightResponse] = Field(default_factory=list, description="List of analyzed insights") 
    sentiment_distribution: SentimentDistribution = Field(..., description="Sentiment breakdown")
    top_topics: List[TopicFrequency] = Field(..., description="Most discussed topics")
    recent_trends: List[TrendData] = Field(..., description="Recent trend data")
    average_confidence: float = Field(..., description="Average confidence score")
    last_updated: datetime = Field(..., description="Last update timestamp")

class Recommendation(BaseModel):
    """Recommendation model"""
    category: str = Field(..., description="Recommendation category")
    priority: str = Field(..., description="Priority level (high, medium, low)")
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    action_items: List[str] = Field(..., description="Specific action items")
    impact_score: float = Field(..., ge=0, le=1, description="Expected impact score")

class RecommendationsResponse(BaseModel):
    """Recommendations response model"""
    recommendations: List[Recommendation] = Field(..., description="Generated recommendations")
    total_recommendations: int = Field(..., description="Total number of recommendations")
    high_priority_count: int = Field(..., description="Number of high priority recommendations")
    generated_at: datetime = Field(..., description="Generation timestamp")

