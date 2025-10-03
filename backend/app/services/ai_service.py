"""
AI service for processing reviews and extracting insights
"""

from groq import Groq
import time
import json
from typing import Dict, Any, List
from app.core.config import settings
from datetime import datetime

class AIService:
    """Service for AI-powered review analysis using Groq"""
    
    def __init__(self):
        """Initialize Groq client"""
        try:
            self.client = Groq(api_key=settings.groq_api_key)
            self.model = settings.groq_model
        except Exception as e:
            print(f"Warning: Failed to initialize Groq client: {str(e)}")
            self.client = None
            self.model = settings.groq_model
    
    async def analyze_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a single review and extract insights
        
        Args:
            review: Review data dictionary
            
        Returns:
            Dictionary containing extracted insights
        """
        start_time = time.time()
        
        try:
            # Check if client is available
            if self.client is None:
                raise Exception("Groq client not initialized - API key may be invalid")
            
            # Prepare the prompt for analysis
            prompt = self._create_analysis_prompt(review)
            
            # Call Groq API
            response = await self._call_groq_api(prompt)
            
            # Parse the response
            insights = self._parse_ai_response(response)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Prepare insight data - handle MongoDB _id properly
            review_id = str(review.get("_id", review.get("id", "")))
            
            insight_data = {
                "review_id": review_id,
                "sentiment": insights.get("sentiment", "neutral"),
                "confidence": insights.get("confidence", 0.5),
                "topics": insights.get("topics", []),
                "positive_aspects": insights.get("positive_aspects", []),
                "negative_aspects": insights.get("negative_aspects", []),
                "problems": insights.get("problems", []),
                "suggestions": insights.get("suggestions", []),
                "keywords": insights.get("keywords", []),
                "summary": insights.get("summary", ""),
                "processing_time": processing_time,
                "ai_model": self.model,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            return insight_data
            
        except Exception as e:
            print(f"Error analyzing review: {str(e)}")
            # Return default insight data in case of error
            return self._create_default_insight(review, str(e))
    
    def _create_analysis_prompt(self, review: Dict[str, Any]) -> str:
        """Create a detailed prompt for AI analysis"""
        
        review_text = review.get("text", "")
        rating = review.get("rating", "")
        
        prompt = f"""
        Analyze the following customer review and extract actionable insights for business decision-making.

        Review Text: "{review_text}"
        Rating: {rating}

        Please provide a comprehensive analysis in the following JSON format:

        {{
            "sentiment": "positive|negative|neutral",
            "confidence": 0.0-1.0,
            "topics": ["topic1", "topic2", "topic3"],
            "positive_aspects": ["what customers liked"],
            "negative_aspects": ["what customers disliked"],
            "problems": ["specific problems mentioned"],
            "suggestions": ["actionable suggestions for improvement"],
            "keywords": ["key terms and phrases"],
            "summary": "Brief summary of the review and key insights"
        }}

        Guidelines:
        1. Be specific and actionable in your analysis
        2. Identify clear problems and potential solutions
        3. Extract topics that are relevant to business operations
        4. Focus on insights that can drive business decisions
        5. Ensure the sentiment analysis is accurate based on the content
        6. Provide confidence scores based on clarity of sentiment indicators

        Example of good analysis:
        - If customer mentions "love the discount program" → positive_aspects: ["discount program"]
        - If customer says "search is frustrating" → negative_aspects: ["search functionality"], problems: ["irrelevant search results"]
        - If customer suggests "add category filters" → suggestions: ["implement category filters"]

        Respond only with valid JSON, no additional text.
        """
        
        return prompt
    
    async def _call_groq_api(self, prompt: str) -> str:
        """Call Groq API with the given prompt"""
        try:
            # Create a simple, clean request
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert business analyst specializing in customer feedback analysis. Provide accurate, actionable insights in the requested JSON format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            # Extract content safely
            if response.choices and len(response.choices) > 0:
                message = response.choices[0].message
                if message and message.content:
                    return message.content.strip()
                else:
                    raise Exception("Empty response from Groq API")
            else:
                raise Exception("No choices in Groq API response")
            
        except Exception as e:
            print(f"Groq API error: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            raise
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI response and extract structured data"""
        try:
            # Clean the response (remove any markdown formatting)
            response = response.replace("```json", "").replace("```", "").strip()
            
            # Parse JSON
            insights = json.loads(response)
            
            # Validate and clean the data
            return {
                "sentiment": insights.get("sentiment", "neutral").lower(),
                "confidence": float(insights.get("confidence", 0.5)),
                "topics": insights.get("topics", []),
                "positive_aspects": insights.get("positive_aspects", []),
                "negative_aspects": insights.get("negative_aspects", []),
                "problems": insights.get("problems", []),
                "suggestions": insights.get("suggestions", []),
                "keywords": insights.get("keywords", []),
                "summary": insights.get("summary", "")
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Response was: {response}")
            return self._create_fallback_insights(response)
        except Exception as e:
            print(f"Error parsing AI response: {str(e)}")
            return self._create_fallback_insights(response)
    
    def _create_fallback_insights(self, response: str) -> Dict[str, Any]:
        """Create fallback insights when AI response parsing fails"""
        return {
            "sentiment": "neutral",
            "confidence": 0.3,
            "topics": ["general"],
            "positive_aspects": [],
            "negative_aspects": [],
            "problems": [],
            "suggestions": [],
            "keywords": [],
            "summary": f"Analysis failed. Raw response: {response[:200]}..."
        }
    
    def _create_default_insight(self, review: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Create default insight data when analysis fails"""
        review_id = str(review.get("_id", review.get("id", "")))
        
        return {
            "review_id": review_id,
            "sentiment": "neutral",
            "confidence": 0.1,
            "topics": ["error"],
            "positive_aspects": [],
            "negative_aspects": [],
            "problems": [f"Analysis error: {error}"],
            "suggestions": ["Review AI service configuration"],
            "keywords": [],
            "summary": f"Failed to analyze review due to error: {error}",
            "processing_time": 0.0,
            "ai_model": self.model,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    async def batch_analyze_reviews(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze multiple reviews in batch
        
        Args:
            reviews: List of review dictionaries
            
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        for review in reviews:
            try:
                insight = await self.analyze_review(review)
                insights.append(insight)
            except Exception as e:
                print(f"Failed to analyze review {review.get('_id')}: {str(e)}")
                # Add error insight
                error_insight = self._create_default_insight(review, str(e))
                insights.append(error_insight)
        
        return insights