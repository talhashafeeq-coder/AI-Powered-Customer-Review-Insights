
"""
Analytics API endpoints (Fully Updated)
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId

from app.database import get_database
from app.models.analytics import (
    AnalyticsSummary, 
    SentimentDistribution, 
    TopicFrequency, 
    TrendData,
    RecommendationsResponse,
    Recommendation
)
from app.services.analytics_service import AnalyticsService

router = APIRouter()
analytics_service = AnalyticsService()

def str_objectid(oid):
    if isinstance(oid, ObjectId):
        return str(oid)
    return oid

@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(db=Depends(get_database)):
    """Get comprehensive analytics summary including insights"""
    try:
        total_reviews = await db.reviews.count_documents({})
        analyzed_reviews = await db.reviews.count_documents({"is_analyzed": True})

        # Fetch all insights for frontend
        insights_cursor = db.insights.find({})
        insights_list = await insights_cursor.to_list(length=None)

        # Sentiment distribution
        sentiment_pipeline = [
            {"$match": {"is_analyzed": True}},
            {"$lookup": {
                "from": "insights",
                "let": {"reviewId": {"$toString": "$_id"}},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$review_id", "$$reviewId"]}}}],
                "as": "insights"
            }},
            {"$unwind": "$insights"},
            {"$group": {"_id": "$insights.sentiment", "count": {"$sum": 1}}}
        ]
        sentiment_data = await db.reviews.aggregate(sentiment_pipeline).to_list(length=None)
        sentiment_counts = {item["_id"]: item["count"] for item in sentiment_data}
        sentiment_distribution = SentimentDistribution(
            positive=sentiment_counts.get("positive", 0),
            negative=sentiment_counts.get("negative", 0),
            neutral=sentiment_counts.get("neutral", 0),
            total=analyzed_reviews
        )

        # Top topics
        topics_pipeline = [
            {"$unwind": {"path": "$topics", "preserveNullAndEmptyArrays": True}},
            {"$group": {"_id": "$topics", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        topics_data = await db.insights.aggregate(topics_pipeline).to_list(length=10)
        total_topic_mentions = sum(item["count"] for item in topics_data)
        top_topics = [
            TopicFrequency(
                topic=item["_id"] if item["_id"] else "unknown",
                count=item["count"],
                percentage=(item["count"] / total_topic_mentions * 100) if total_topic_mentions > 0 else 0
            )
            for item in topics_data
        ]

        # Recent trends
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        trends_pipeline = [
            {"$match": {"is_analyzed": True, "created_at": {"$gte": thirty_days_ago}}},
            {"$lookup": {
                "from": "insights",
                "let": {"reviewId": {"$toString": "$_id"}},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$review_id", "$$reviewId"]}}}],
                "as": "insights"
            }},
            {"$unwind": "$insights"},
            {"$group": {
                "_id": {"year": {"$year": "$created_at"}, "month": {"$month": "$created_at"}, "day": {"$dayOfMonth": "$created_at"}},
                "sentiment_score": {"$avg": "$insights.confidence"},
                "review_count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        trends_data = await db.reviews.aggregate(trends_pipeline).to_list(length=None)
        recent_trends = [
            TrendData(
                date=f"{item['_id']['year']}-{item['_id']['month']:02d}-{item['_id']['day']:02d}",
                sentiment_score=item["sentiment_score"],
                review_count=item["review_count"]
            )
            for item in trends_data
        ]

        # Average confidence
        confidence_pipeline = [{"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence"}}}]
        confidence_data = await db.insights.aggregate(confidence_pipeline).to_list(length=1)
        average_confidence = confidence_data[0]["avg_confidence"] if confidence_data else 0.0

        return AnalyticsSummary(
            total_reviews=total_reviews,
            analyzed_reviews=analyzed_reviews,
            insights=insights_list,  # THIS FIXES FRONTEND ISSUE
            sentiment_distribution=sentiment_distribution,
            top_topics=top_topics,
            recent_trends=recent_trends,
            average_confidence=average_confidence,
            last_updated=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics summary: {str(e)}")

@router.get("/sentiment")
async def get_sentiment_analytics(db=Depends(get_database)):
    """Get detailed sentiment analytics"""
    try:
        sentiment_pipeline = [
            {"$group": {
                "_id": "$sentiment",
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence"}
            }},
            {"$sort": {"count": -1}}
        ]
        sentiment_cursor = db.insights.aggregate(sentiment_pipeline)
        sentiment_data = await sentiment_cursor.to_list(length=None)

        return {
            "sentiment_breakdown": sentiment_data,
            "total_insights": sum(item["count"] for item in sentiment_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sentiment analytics: {str(e)}")


@router.get("/topics")
async def get_topic_analytics(
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_database)
):
    """Get topic analytics"""
    try:
        topics_pipeline = [
            {"$unwind": {"path": "$topics", "preserveNullAndEmptyArrays": True}},
            {"$group": {
                "_id": "$topics",
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": limit}
        ]
        topics_cursor = db.insights.aggregate(topics_pipeline)
        topics_data = await topics_cursor.to_list(length=limit)

        return {
            "topics": topics_data,
            "total_unique_topics": len(topics_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch topic analytics: {str(e)}")


@router.get("/trends")
async def get_trend_analytics(
    days: int = Query(30, ge=1, le=365),
    db=Depends(get_database)
):
    """Get trend analytics over time"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        trends_pipeline = [
            {"$match": {"is_analyzed": True, "created_at": {"$gte": start_date}}},
            {"$lookup": {
                "from": "insights",
                "let": {"reviewId": {"$toString": "$_id"}},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$review_id", "$$reviewId"]}}}],
                "as": "insights"
            }},
            {"$unwind": "$insights"},
            {"$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"}
                },
                "sentiment_score": {"$avg": "$insights.confidence"},
                "review_count": {"$sum": 1},
                "positive_count": {"$sum": {"$cond": [{"$eq": ["$insights.sentiment", "positive"]}, 1, 0]}},
                "negative_count": {"$sum": {"$cond": [{"$eq": ["$insights.sentiment", "negative"]}, 1, 0]}}
            }},
            {"$sort": {"_id": 1}}
        ]
        trends_cursor = db.reviews.aggregate(trends_pipeline)
        trends_data = await trends_cursor.to_list(length=None)

        return {
            "trends": trends_data,
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trend analytics: {str(e)}")


@router.get("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(db=Depends(get_database)):
    """Get AI-generated business recommendations"""
    try:
        recommendations = await analytics_service.generate_recommendations(db)
        high_priority_count = sum(1 for rec in recommendations if rec.priority == "high")

        return RecommendationsResponse(
            recommendations=recommendations,
            total_recommendations=len(recommendations),
            high_priority_count=high_priority_count,
            generated_at=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@router.get("/dashboard")
async def get_dashboard_data(db=Depends(get_database)):
    """Get comprehensive dashboard data"""
    try:
        summary = await get_analytics_summary(db)
        sentiment = await get_sentiment_analytics(db)
        topics = await get_topic_analytics(db)
        trends = await get_trend_analytics(db)

        return {
            "summary": summary,
            "sentiment": sentiment,
            "topics": topics,
            "trends": trends,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard data: {str(e)}")
