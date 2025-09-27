"""
Review service for business logic
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.database import get_database

class ReviewService:
    """Service for review-related business logic"""
    
    def __init__(self):
        pass
    
    async def get_review_statistics(self, db) -> Dict[str, Any]:
        """Get comprehensive review statistics"""
        try:
            # Total reviews
            total_reviews = await db.reviews.count_documents({})
            
            # Analyzed reviews
            analyzed_reviews = await db.reviews.count_documents({"is_analyzed": True})
            
            # Reviews by rating
            rating_pipeline = [
                {"$group": {
                    "_id": "$rating",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}}
            ]
            
            rating_cursor = db.reviews.aggregate(rating_pipeline)
            rating_stats = await rating_cursor.to_list(length=None)
            
            # Recent reviews (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_reviews = await db.reviews.count_documents({
                "created_at": {"$gte": seven_days_ago}
            })
            
            return {
                "total_reviews": total_reviews,
                "analyzed_reviews": analyzed_reviews,
                "pending_analysis": total_reviews - analyzed_reviews,
                "rating_distribution": rating_stats,
                "recent_reviews": recent_reviews,
                "analysis_percentage": (analyzed_reviews / total_reviews * 100) if total_reviews > 0 else 0
            }
            
        except Exception as e:
            print(f"Error getting review statistics: {str(e)}")
            return {}
    
    async def search_reviews(
        self, 
        query: str, 
        db, 
        skip: int = 0, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search reviews by text content"""
        try:
            # Create text search query
            search_query = {
                "$or": [
                    {"text": {"$regex": query, "$options": "i"}},
                    {"rating": {"$regex": query, "$options": "i"}},
                    {"source": {"$regex": query, "$options": "i"}}
                ]
            }
            
            cursor = db.reviews.find(search_query).skip(skip).limit(limit).sort("created_at", -1)
            reviews = await cursor.to_list(length=limit)
            
            return reviews
            
        except Exception as e:
            print(f"Error searching reviews: {str(e)}")
            return []
    
    async def get_reviews_by_date_range(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        db,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get reviews within a date range"""
        try:
            query = {
                "created_at": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
            
            cursor = db.reviews.find(query).skip(skip).limit(limit).sort("created_at", -1)
            reviews = await cursor.to_list(length=limit)
            
            return reviews
            
        except Exception as e:
            print(f"Error getting reviews by date range: {str(e)}")
            return []
    
    async def get_most_common_topics(self, db, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most common topics from insights"""
        try:
            pipeline = [
                {"$unwind": "$topics"},
                {"$group": {
                    "_id": "$topics",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": limit}
            ]
            
            cursor = db.insights.aggregate(pipeline)
            topics = await cursor.to_list(length=limit)
            
            return topics
            
        except Exception as e:
            print(f"Error getting common topics: {str(e)}")
            return []
    
    async def get_review_quality_score(self, review: Dict[str, Any]) -> float:
        """Calculate a quality score for a review"""
        try:
            score = 0.0
            
            # Text length score (0-0.3)
            text_length = len(review.get("text", ""))
            if text_length > 100:
                score += 0.3
            elif text_length > 50:
                score += 0.2
            elif text_length > 20:
                score += 0.1
            
            # Rating presence score (0-0.2)
            if review.get("rating"):
                score += 0.2
            
            # Date presence score (0-0.1)
            if review.get("date"):
                score += 0.1
            
            # Source presence score (0-0.1)
            if review.get("source"):
                score += 0.1
            
            # User ID presence score (0-0.1)
            if review.get("user_id"):
                score += 0.1
            
            # Sentiment indicators score (0-0.2)
            text = review.get("text", "").lower()
            sentiment_words = ["love", "hate", "great", "terrible", "amazing", "awful", "excellent", "poor"]
            sentiment_count = sum(1 for word in sentiment_words if word in text)
            if sentiment_count > 0:
                score += min(0.2, sentiment_count * 0.05)
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error calculating quality score: {str(e)}")
            return 0.0
