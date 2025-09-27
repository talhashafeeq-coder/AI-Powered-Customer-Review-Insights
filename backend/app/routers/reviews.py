"""
Review management API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.database import get_database
from app.models.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.ai_service import AIService
from app.services.review_service import ReviewService

router = APIRouter()

# Initialize services
ai_service = AIService()
review_service = ReviewService()

@router.post("/", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, db=Depends(get_database)):
    """Create a new review"""
    try:
        review_data = review.model_dump()
        review_data["created_at"] = datetime.utcnow()
        review_data["updated_at"] = datetime.utcnow()
        review_data["is_analyzed"] = False
        
        result = await db.reviews.insert_one(review_data)
        created_review = await db.reviews.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for response
        if created_review:
            created_review["id"] = str(created_review["_id"])
            del created_review["_id"]
        
        return ReviewResponse(**created_review)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@router.get("/", response_model=List[ReviewResponse])
async def get_reviews(
    skip: int = Query(0, ge=0, description="Number of reviews to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of reviews to return"),
    analyzed_only: bool = Query(False, description="Return only analyzed reviews"),
    db=Depends(get_database)
):
    """Get all reviews with pagination"""
    try:
        filter_query = {}
        if analyzed_only:
            filter_query["is_analyzed"] = True
            
        cursor = db.reviews.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        reviews = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        for review in reviews:
            review["id"] = str(review["_id"])
            del review["_id"]
        
        return [ReviewResponse(**review) for review in reviews]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")

@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: str, db=Depends(get_database)):
    """Get a specific review by ID"""
    try:
        if not ObjectId.is_valid(review_id):
            raise HTTPException(status_code=400, detail="Invalid review ID format")
            
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Convert ObjectId to string
        review["id"] = str(review["_id"])
        del review["_id"]
            
        return ReviewResponse(**review)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch review: {str(e)}")

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str, 
    review_update: ReviewUpdate, 
    db=Depends(get_database)
):
    """Update a review"""
    try:
        if not ObjectId.is_valid(review_id):
            raise HTTPException(status_code=400, detail="Invalid review ID format")
            
        # Check if review exists
        existing_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Prepare update data
        update_data = {k: v for k, v in review_update.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Update review
        await db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": update_data}
        )
        
        # Return updated review
        updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        updated_review["id"] = str(updated_review["_id"])
        del updated_review["_id"]
        return ReviewResponse(**updated_review)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update review: {str(e)}")

@router.delete("/{review_id}")
async def delete_review(review_id: str, db=Depends(get_database)):
    """Delete a review"""
    try:
        if not ObjectId.is_valid(review_id):
            raise HTTPException(status_code=400, detail="Invalid review ID format")
            
        # Check if review exists
        existing_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Delete review and associated insights
        await db.reviews.delete_one({"_id": ObjectId(review_id)})
        await db.insights.delete_many({"review_id": review_id})
        
        return {"message": "Review deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete review: {str(e)}")

@router.post("/{review_id}/analyze")
async def analyze_review(review_id: str, db=Depends(get_database)):
    """Analyze a single review using AI"""
    try:
        if not ObjectId.is_valid(review_id):
            raise HTTPException(status_code=400, detail="Invalid review ID format")
            
        # Get review
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Check if already analyzed
        existing_insight = await db.insights.find_one({"review_id": review_id})
        if existing_insight:
            return {"message": "Review already analyzed", "insight_id": str(existing_insight["_id"])}
        
        # Analyze review
        insight_data = await ai_service.analyze_review(review)
        
        # Save insight
        insight_result = await db.insights.insert_one(insight_data)
        
        # Update review as analyzed
        await db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"is_analyzed": True, "updated_at": datetime.utcnow()}}
        )
        
        return {
            "message": "Review analyzed successfully",
            "insight_id": str(insight_result.inserted_id),
            "insight": insight_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze review: {str(e)}")

@router.get("/{review_id}/insights")
async def get_review_insights(review_id: str, db=Depends(get_database)):
    """Get insights for a specific review"""
    try:
        if not ObjectId.is_valid(review_id):
            raise HTTPException(status_code=400, detail="Invalid review ID format")
            
        insight = await db.insights.find_one({"review_id": review_id})
        if not insight:
            raise HTTPException(status_code=404, detail="No insights found for this review")
        
        # Convert ObjectId to string
        insight["id"] = str(insight["_id"])
        del insight["_id"]
            
        return insight
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights: {str(e)}")