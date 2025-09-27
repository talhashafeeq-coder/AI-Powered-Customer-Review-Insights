"""
Insights management API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId

from app.database import get_database
from app.models.insight import InsightResponse, BatchAnalysisRequest, BatchAnalysisResponse
from app.services.ai_service import AIService

router = APIRouter()

# Initialize AI service
ai_service = AIService()

@router.get("/", response_model=List[InsightResponse])
async def get_insights(
    skip: int = Query(0, ge=0, description="Number of insights to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of insights to return"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    db=Depends(get_database)
):
    """Get all insights with optional filtering"""
    try:
        filter_query = {}
        if sentiment:
            filter_query["sentiment"] = sentiment.lower()
            
        cursor = db.insights.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        insights = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        for insight in insights:
            insight["id"] = str(insight["_id"])
            del insight["_id"]
        
        return [InsightResponse(**insight) for insight in insights]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights: {str(e)}")

@router.get("/{insight_id}", response_model=InsightResponse)
async def get_insight(insight_id: str, db=Depends(get_database)):
    """Get a specific insight by ID"""
    try:
        if not ObjectId.is_valid(insight_id):
            raise HTTPException(status_code=400, detail="Invalid insight ID format")
            
        insight = await db.insights.find_one({"_id": ObjectId(insight_id)})
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Convert ObjectId to string
        insight["id"] = str(insight["_id"])
        del insight["_id"]
            
        return InsightResponse(**insight)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch insight: {str(e)}")

@router.post("/batch-analyze", response_model=BatchAnalysisResponse)
async def batch_analyze_reviews(
    request: BatchAnalysisRequest,
    db=Depends(get_database)
):
    """Analyze multiple reviews in batch"""
    try:
        import time
        start_time = time.time()
        
        successful_analyses = 0
        failed_analyses = 0
        insights = []
        
        for review_id in request.review_ids:
            try:
                # Check if review exists
                if not ObjectId.is_valid(review_id):
                    failed_analyses += 1
                    continue
                    
                review = await db.reviews.find_one({"_id": ObjectId(review_id)})
                if not review:
                    failed_analyses += 1
                    continue
                
                # Check if already analyzed and not forcing reanalysis
                if not request.force_reanalysis:
                    existing_insight = await db.insights.find_one({"review_id": review_id})
                    if existing_insight:
                        existing_insight["id"] = str(existing_insight["_id"])
                        del existing_insight["_id"]
                        insights.append(InsightResponse(**existing_insight))
                        successful_analyses += 1
                        continue
                
                # Analyze review
                insight_data = await ai_service.analyze_review(review)
                
                # Save insight
                insight_result = await db.insights.insert_one(insight_data)
                insight_data["id"] = str(insight_result.inserted_id)
                insights.append(InsightResponse(**insight_data))
                
                # Update review as analyzed
                await db.reviews.update_one(
                    {"_id": ObjectId(review_id)},
                    {"$set": {"is_analyzed": True}}
                )
                
                successful_analyses += 1
                
            except Exception as e:
                print(f"Failed to analyze review {review_id}: {str(e)}")
                failed_analyses += 1
        
        processing_time = time.time() - start_time
        
        return BatchAnalysisResponse(
            total_reviews=len(request.review_ids),
            successful_analyses=successful_analyses,
            failed_analyses=failed_analyses,
            processing_time=processing_time,
            insights=insights
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to batch analyze reviews: {str(e)}")

@router.get("/by-sentiment/{sentiment}")
async def get_insights_by_sentiment(
    sentiment: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db=Depends(get_database)
):
    """Get insights filtered by sentiment"""
    try:
        cursor = db.insights.find({"sentiment": sentiment.lower()}).skip(skip).limit(limit).sort("created_at", -1)
        insights = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        for insight in insights:
            insight["id"] = str(insight["_id"])
            del insight["_id"]
        
        return [InsightResponse(**insight) for insight in insights]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights by sentiment: {str(e)}")

@router.get("/by-topic/{topic}")
async def get_insights_by_topic(
    topic: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db=Depends(get_database)
):
    """Get insights filtered by topic"""
    try:
        cursor = db.insights.find({"topics": {"$in": [topic]}}).skip(skip).limit(limit).sort("created_at", -1)
        insights = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        for insight in insights:
            insight["id"] = str(insight["_id"])
            del insight["_id"]
        
        return [InsightResponse(**insight) for insight in insights]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights by topic: {str(e)}")

@router.delete("/{insight_id}")
async def delete_insight(insight_id: str, db=Depends(get_database)):
    """Delete an insight"""
    try:
        if not ObjectId.is_valid(insight_id):
            raise HTTPException(status_code=400, detail="Invalid insight ID format")
            
        # Check if insight exists
        existing_insight = await db.insights.find_one({"_id": ObjectId(insight_id)})
        if not existing_insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Delete insight
        await db.insights.delete_one({"_id": ObjectId(insight_id)})
        
        # Update review as not analyzed
        await db.reviews.update_one(
            {"review_id": existing_insight["review_id"]},
            {"$set": {"is_analyzed": False}}
        )
        
        return {"message": "Insight deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete insight: {str(e)}")