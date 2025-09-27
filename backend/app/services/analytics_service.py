"""
Analytics service for generating business insights and recommendations
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import Counter
from app.models.analytics import Recommendation

class AnalyticsService:
    """Service for analytics and business intelligence"""
    
    def __init__(self):
        pass
    
    async def generate_recommendations(self, db) -> List[Recommendation]:
        """Generate AI-powered business recommendations based on review insights"""
        try:
            recommendations = []
            
            # Get recent insights (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            # Get sentiment distribution
            sentiment_pipeline = [
                {"$match": {"created_at": {"$gte": thirty_days_ago}}},
                {"$group": {
                    "_id": "$sentiment",
                    "count": {"$sum": 1},
                    "avg_confidence": {"$avg": "$confidence"}
                }}
            ]
            
            sentiment_cursor = db.insights.aggregate(sentiment_pipeline)
            sentiment_data = await sentiment_cursor.to_list(length=None)
            
            # Get most common problems
            problems_pipeline = [
                {"$match": {"created_at": {"$gte": thirty_days_ago}}},
                {"$unwind": "$problems"},
                {"$group": {
                    "_id": "$problems",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            
            problems_cursor = db.insights.aggregate(problems_pipeline)
            problems_data = await problems_cursor.to_list(length=10)
            
            # Get most common suggestions
            suggestions_pipeline = [
                {"$match": {"created_at": {"$gte": thirty_days_ago}}},
                {"$unwind": "$suggestions"},
                {"$group": {
                    "_id": "$suggestions",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            
            suggestions_cursor = db.insights.aggregate(suggestions_pipeline)
            suggestions_data = await suggestions_cursor.to_list(length=10)
            
            # Get topic trends
            topics_pipeline = [
                {"$match": {"created_at": {"$gte": thirty_days_ago}}},
                {"$unwind": "$topics"},
                {"$group": {
                    "_id": "$topics",
                    "count": {"$sum": 1},
                    "avg_confidence": {"$avg": "$confidence"}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 15}
            ]
            
            topics_cursor = db.insights.aggregate(topics_pipeline)
            topics_data = await topics_cursor.to_list(length=15)
            
            # Generate recommendations based on data
            
            # 1. Sentiment-based recommendations
            if sentiment_data:
                negative_count = next((item["count"] for item in sentiment_data if item["_id"] == "negative"), 0)
                positive_count = next((item["count"] for item in sentiment_data if item["_id"] == "positive"), 0)
                total_sentiment = sum(item["count"] for item in sentiment_data)
                
                if total_sentiment > 0:
                    negative_percentage = (negative_count / total_sentiment) * 100
                    
                    if negative_percentage > 40:
                        recommendations.append(Recommendation(
                            category="Customer Satisfaction",
                            priority="high",
                            title="High Negative Sentiment Detected",
                            description=f"Recent reviews show {negative_percentage:.1f}% negative sentiment. Immediate attention required.",
                            action_items=[
                                "Review recent negative feedback patterns",
                                "Implement customer satisfaction improvement plan",
                                "Set up automated alerts for negative sentiment spikes"
                            ],
                            impact_score=0.9
                        ))
                    elif negative_percentage > 25:
                        recommendations.append(Recommendation(
                            category="Customer Satisfaction",
                            priority="medium",
                            title="Moderate Negative Sentiment",
                            description=f"Recent reviews show {negative_percentage:.1f}% negative sentiment. Monitor closely.",
                            action_items=[
                                "Analyze common negative themes",
                                "Develop targeted improvement initiatives",
                                "Increase customer feedback monitoring"
                            ],
                            impact_score=0.6
                        ))
            
            # 2. Problem-based recommendations
            if problems_data:
                top_problem = problems_data[0]
                if top_problem["count"] > 5:  # If mentioned more than 5 times
                    recommendations.append(Recommendation(
                        category="Product/Service Issues",
                        priority="high",
                        title=f"Frequent Problem: {top_problem['_id']}",
                        description=f"This issue has been mentioned {top_problem['count']} times in recent reviews.",
                        action_items=[
                            f"Investigate root cause of: {top_problem['_id']}",
                            "Develop solution implementation plan",
                            "Create customer communication strategy",
                            "Set up progress tracking"
                        ],
                        impact_score=0.8
                    ))
            
            # 3. Suggestion-based recommendations
            if suggestions_data:
                top_suggestion = suggestions_data[0]
                if top_suggestion["count"] > 3:  # If suggested more than 3 times
                    recommendations.append(Recommendation(
                        category="Feature Development",
                        priority="medium",
                        title=f"Customer Request: {top_suggestion['_id']}",
                        description=f"Customers have suggested this improvement {top_suggestion['count']} times.",
                        action_items=[
                            f"Evaluate feasibility of: {top_suggestion['_id']}",
                            "Conduct market research",
                            "Create implementation roadmap",
                            "Communicate with product team"
                        ],
                        impact_score=0.7
                    ))
            
            # 4. Topic-based recommendations
            if topics_data:
                # Find topics with high frequency but low confidence (potential issues)
                for topic in topics_data:
                    if topic["count"] > 5 and topic["avg_confidence"] < 0.6:
                        recommendations.append(Recommendation(
                            category="Content Quality",
                            priority="medium",
                            title=f"Unclear Topic: {topic['_id']}",
                            description=f"Topic '{topic['_id']}' is frequently mentioned but with low confidence scores.",
                            action_items=[
                                f"Clarify messaging around: {topic['_id']}",
                                "Improve product documentation",
                                "Train customer support team",
                                "Update marketing materials"
                            ],
                            impact_score=0.5
                        ))
            
            # 5. General recommendations based on data quality
            total_insights = await db.insights.count_documents({})
            if total_insights > 0:
                avg_confidence_pipeline = [
                    {"$group": {
                        "_id": None,
                        "avg_confidence": {"$avg": "$confidence"}
                    }}
                ]
                
                avg_confidence_cursor = db.insights.aggregate(avg_confidence_pipeline)
                avg_confidence_data = await avg_confidence_cursor.to_list(length=1)
                
                if avg_confidence_data and avg_confidence_data[0]["avg_confidence"] < 0.7:
                    recommendations.append(Recommendation(
                        category="Data Quality",
                        priority="low",
                        title="Improve Review Analysis Quality",
                        description="Average confidence score is below 70%. Consider improving review prompts or data quality.",
                        action_items=[
                            "Review AI analysis prompts",
                            "Improve review data collection",
                            "Implement data validation",
                            "Monitor analysis accuracy"
                        ],
                        impact_score=0.4
                    ))
            
            # Sort recommendations by priority and impact
            priority_order = {"high": 3, "medium": 2, "low": 1}
            recommendations.sort(key=lambda x: (priority_order[x.priority], x.impact_score), reverse=True)
            
            return recommendations[:10]  # Return top 10 recommendations
            
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return []
    
    async def get_insight_trends(self, db, days: int = 30) -> Dict[str, Any]:
        """Get insight trends over time"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Get daily insight trends
            trends_pipeline = [
                {"$match": {"created_at": {"$gte": start_date}}},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day": {"$dayOfMonth": "$created_at"}
                    },
                    "total_insights": {"$sum": 1},
                    "avg_confidence": {"$avg": "$confidence"},
                    "sentiment_breakdown": {
                        "$push": "$sentiment"
                    }
                }},
                {"$sort": {"_id": 1}}
            ]
            
            trends_cursor = db.insights.aggregate(trends_pipeline)
            trends_data = await trends_cursor.to_list(length=None)
            
            # Process sentiment breakdown
            for trend in trends_data:
                sentiment_counts = Counter(trend["sentiment_breakdown"])
                trend["sentiment_counts"] = dict(sentiment_counts)
                del trend["sentiment_breakdown"]  # Remove the array to save space
            
            return {
                "trends": trends_data,
                "period_days": days,
                "total_insights": len(trends_data)
            }
            
        except Exception as e:
            print(f"Error getting insight trends: {str(e)}")
            return {"trends": [], "period_days": days, "total_insights": 0}
    
    async def get_insight_quality_metrics(self, db) -> Dict[str, Any]:
        """Get quality metrics for insights"""
        try:
            # Get confidence distribution
            confidence_pipeline = [
                {"$group": {
                    "_id": {
                        "$switch": {
                            "branches": [
                                {"case": {"$lt": ["$confidence", 0.3]}, "value": "low"},
                                {"case": {"$lt": ["$confidence", 0.7]}, "value": "medium"},
                                {"case": {"$gte": ["$confidence", 0.7]}, "value": "high"}
                            ],
                            "default": "unknown"
                        }
                    },
                    "count": {"$sum": 1}
                }}
            ]
            
            confidence_cursor = db.insights.aggregate(confidence_pipeline)
            confidence_data = await confidence_cursor.to_list(length=None)
            
            # Get processing time statistics
            processing_pipeline = [
                {"$group": {
                    "_id": None,
                    "avg_processing_time": {"$avg": "$processing_time"},
                    "max_processing_time": {"$max": "$processing_time"},
                    "min_processing_time": {"$min": "$processing_time"}
                }}
            ]
            
            processing_cursor = db.insights.aggregate(processing_pipeline)
            processing_data = await processing_cursor.to_list(length=1)
            
            # Get model usage statistics
            model_pipeline = [
                {"$group": {
                    "_id": "$ai_model",
                    "count": {"$sum": 1}
                }}
            ]
            
            model_cursor = db.insights.aggregate(model_pipeline)
            model_data = await model_cursor.to_list(length=None)
            
            return {
                "confidence_distribution": confidence_data,
                "processing_time_stats": processing_data[0] if processing_data else {},
                "model_usage": model_data,
                "total_insights": sum(item["count"] for item in confidence_data)
            }
            
        except Exception as e:
            print(f"Error getting insight quality metrics: {str(e)}")
            return {}
