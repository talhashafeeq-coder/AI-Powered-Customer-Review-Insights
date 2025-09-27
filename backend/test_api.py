#!/usr/bin/env python3
"""
Simple test script for the API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_create_review():
    """Test creating a review"""
    try:
        review_data = {
            "text": "I love the discount program in this app - saved 30% on my last order! However, the search functionality is really frustrating. Results are rarely relevant to what I'm looking for. They should implement category filters and improve their search algorithm.",
            "rating": "★★★☆☆ (3 stars)",
            "date": "2025-01-01",
            "source": "mobile_app"
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        print(f"Create review: {response.status_code}")
        
        if response.status_code == 200:
            review = response.json()
            print(f"Created review with ID: {review.get('_id')}")
            return review.get('_id')
        else:
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"Create review failed: {e}")
        return None

def test_get_reviews():
    """Test getting reviews"""
    try:
        response = requests.get(f"{BASE_URL}/api/reviews")
        print(f"Get reviews: {response.status_code}")
        
        if response.status_code == 200:
            reviews = response.json()
            print(f"Found {len(reviews)} reviews")
            return reviews
        else:
            print(f"Error: {response.text}")
            return []
            
    except Exception as e:
        print(f"Get reviews failed: {e}")
        return []

def test_analyze_review(review_id):
    """Test analyzing a review"""
    try:
        response = requests.post(f"{BASE_URL}/api/reviews/{review_id}/analyze")
        print(f"Analyze review: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Analysis result: {result}")
            return result
        else:
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"Analyze review failed: {e}")
        return None

def test_get_insights():
    """Test getting insights"""
    try:
        response = requests.get(f"{BASE_URL}/api/insights")
        print(f"Get insights: {response.status_code}")
        
        if response.status_code == 200:
            insights = response.json()
            print(f"Found {len(insights)} insights")
            return insights
        else:
            print(f"Error: {response.text}")
            return []
            
    except Exception as e:
        print(f"Get insights failed: {e}")
        return []

def test_analytics():
    """Test analytics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/summary")
        print(f"Analytics: {response.status_code}")
        
        if response.status_code == 200:
            analytics = response.json()
            print(f"Analytics data: {analytics}")
            return analytics
        else:
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"Analytics failed: {e}")
        return None

def main():
    """Run all tests"""
    print("🧪 Testing AI-Powered Customer Review Insights API")
    print("=" * 60)
    
    # Test health
    if not test_health():
        print("❌ Health check failed. Is the server running?")
        return
    
    print("✅ Health check passed")
    
    # Test creating a review
    review_id = test_create_review()
    if not review_id:
        print("❌ Failed to create review")
        return
    
    print("✅ Review created successfully")
    
    # Test getting reviews
    reviews = test_get_reviews()
    print(f"✅ Retrieved {len(reviews)} reviews")
    
    # Test analyzing review (only if OpenAI API key is configured)
    print("\n🤖 Testing AI analysis...")
    analysis_result = test_analyze_review(review_id)
    if analysis_result:
        print("✅ Review analysis completed")
    else:
        print("⚠️  Review analysis failed (check OpenAI API key)")
    
    # Test getting insights
    insights = test_get_insights()
    print(f"✅ Retrieved {len(insights)} insights")
    
    # Test analytics
    analytics = test_analytics()
    if analytics:
        print("✅ Analytics retrieved successfully")
    else:
        print("⚠️  Analytics failed")
    
    print("\n" + "=" * 60)
    print("🎉 All tests completed!")
    print(f"API Documentation: {BASE_URL}/api/docs")

if __name__ == "__main__":
    main()








