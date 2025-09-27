# """
# AI service for processing reviews and extracting insights
# """

# from openai import AsyncOpenAI  # Changed import
# import time
# import json
# from typing import Dict, Any, List
# from app.core.config import settings

# class AIService:
#     """Service for AI-powered review analysis"""
    
#     def __init__(self):
#         """Initialize OpenAI client"""
#         self.client = AsyncOpenAI(api_key=settings.openai_api_key)  # New SDK syntax
#         self.model = settings.openai_model
    
#     async def analyze_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
#         """
#         Analyze a single review and extract insights
        
#         Args:
#             review: Review data dictionary
            
#         Returns:
#             Dictionary containing extracted insights
#         """
#         start_time = time.time()
        
#         try:
#             # Prepare the prompt for analysis
#             prompt = self._create_analysis_prompt(review)
            
#             # Call OpenAI API
#             response = await self._call_openai_api(prompt)
            
#             # Parse the response
#             insights = self._parse_ai_response(response)
            
#             # Calculate processing time
#             processing_time = time.time() - start_time
            
#             # Prepare insight data
#             insight_data = {
#                "id": str(review["_id"]),       # ✅ convert MongoDB _id to id
#                "review_id": str(review["_id"]),
#                "sentiment": insights.get("sentiment", "neutral"),
#     "confidence": insights.get("confidence", 0.5),
#     "topics": insights.get("topics", []),
#     "positive_aspects": insights.get("positive_aspects", []),
#     "negative_aspects": insights.get("negative_aspects", []),
#     "problems": insights.get("problems", []),
#     "suggestions": insights.get("suggestions", []),
#     "keywords": insights.get("keywords", []),
#     "summary": insights.get("summary", ""),
#     "processing_time": processing_time,
#     "ai_model": self.model,
#     "created_at": datetime.utcnow(),  # ✅ use datetime, not timestamp
#     "updated_at": datetime.utcnow()   # ✅ use datetime
# }

            
#             return insight_data
            
#         except Exception as e:
#             print(f"Error analyzing review: {str(e)}")
#             # Return default insight data in case of error
#             return self._create_default_insight(review, str(e))
    
#     def _create_analysis_prompt(self, review: Dict[str, Any]) -> str:
#         """Create a detailed prompt for AI analysis"""
        
#         review_text = review.get("text", "")
#         rating = review.get("rating", "")
        
#         prompt = f"""
#         Analyze the following customer review and extract actionable insights for business decision-making.

#         Review Text: "{review_text}"
#         Rating: {rating}

#         Please provide a comprehensive analysis in the following JSON format:

#         {{
#             "sentiment": "positive|negative|neutral",
#             "confidence": 0.0-1.0,
#             "topics": ["topic1", "topic2", "topic3"],
#             "positive_aspects": ["what customers liked"],
#             "negative_aspects": ["what customers disliked"],
#             "problems": ["specific problems mentioned"],
#             "suggestions": ["actionable suggestions for improvement"],
#             "keywords": ["key terms and phrases"],
#             "summary": "Brief summary of the review and key insights"
#         }}

#         Guidelines:
#         1. Be specific and actionable in your analysis
#         2. Identify clear problems and potential solutions
#         3. Extract topics that are relevant to business operations
#         4. Focus on insights that can drive business decisions
#         5. Ensure the sentiment analysis is accurate based on the content
#         6. Provide confidence scores based on clarity of sentiment indicators

#         Example of good analysis:
#         - If customer mentions "love the discount program" → positive_aspects: ["discount program"]
#         - If customer says "search is frustrating" → negative_aspects: ["search functionality"], problems: ["irrelevant search results"]
#         - If customer suggests "add category filters" → suggestions: ["implement category filters"]

#         Respond only with valid JSON, no additional text.
#         """
        
#         return prompt
    
#     async def _call_openai_api(self, prompt: str) -> str:
#         """Call OpenAI API with the given prompt"""
#         try:
#             response = await self.client.chat.completions.create(  # New SDK syntax
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": "You are an expert business analyst specializing in customer feedback analysis. Provide accurate, actionable insights in the requested JSON format."},
#                     {"role": "user", "content": prompt}
#                 ],
#                 max_tokens=1000,
#                 temperature=0.3
#             )
            
#             return response.choices[0].message.content.strip()
            
#         except Exception as e:
#             print(f"OpenAI API error: {str(e)}")
#             raise
    
#     def _parse_ai_response(self, response: str) -> Dict[str, Any]:
#         """Parse the AI response and extract structured data"""
#         try:
#             # Clean the response (remove any markdown formatting)
#             response = response.replace("```json", "").replace("```", "").strip()
            
#             # Parse JSON
#             insights = json.loads(response)
            
#             # Validate and clean the data
#             return {
#                 "sentiment": insights.get("sentiment", "neutral").lower(),
#                 "confidence": float(insights.get("confidence", 0.5)),
#                 "topics": insights.get("topics", []),
#                 "positive_aspects": insights.get("positive_aspects", []),
#                 "negative_aspects": insights.get("negative_aspects", []),
#                 "problems": insights.get("problems", []),
#                 "suggestions": insights.get("suggestions", []),
#                 "keywords": insights.get("keywords", []),
#                 "summary": insights.get("summary", "")
#             }
            
#         except json.JSONDecodeError as e:
#             print(f"JSON parsing error: {str(e)}")
#             print(f"Response was: {response}")
#             return self._create_fallback_insights(response)
#         except Exception as e:
#             print(f"Error parsing AI response: {str(e)}")
#             return self._create_fallback_insights(response)
    
#     def _create_fallback_insights(self, response: str) -> Dict[str, Any]:
#         """Create fallback insights when AI response parsing fails"""
#         return {
#             "sentiment": "neutral",
#             "confidence": 0.3,
#             "topics": ["general"],
#             "positive_aspects": [],
#             "negative_aspects": [],
#             "problems": [],
#             "suggestions": [],
#             "keywords": [],
#             "summary": f"Analysis failed. Raw response: {response[:200]}..."
#         }
    
#     def _create_default_insight(self, review: Dict[str, Any], error: str) -> Dict[str, Any]:
#         """Create default insight data when analysis fails"""
#         return {
#             "review_id": str(review["_id"]),
#             "sentiment": "neutral",
#             "confidence": 0.1,
#             "topics": ["error"],
#             "positive_aspects": [],
#             "negative_aspects": [],
#             "problems": [f"Analysis error: {error}"],
#             "suggestions": ["Review AI service configuration"],
#             "keywords": [],
#             "summary": f"Failed to analyze review due to error: {error}",
#             "processing_time": 0.0,
#             "ai_model": self.model,
#             "created_at": time.time(),
#             "updated_at": time.time()
#         }
    
#     async def batch_analyze_reviews(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
#         """
#         Analyze multiple reviews in batch
        
#         Args:
#             reviews: List of review dictionaries
            
#         Returns:
#             List of insight dictionaries
#         """
#         insights = []
        
#         for review in reviews:
#             try:
#                 insight = await self.analyze_review(review)
#                 insights.append(insight)
#             except Exception as e:
#                 print(f"Failed to analyze review {review.get('_id')}: {str(e)}")
#                 # Add error insight
#                 error_insight = self._create_default_insight(review, str(e))
#                 insights.append(error_insight)
        
#         return insights
# """
# AI service for processing reviews and extracting insights (fixed)
# """

# from openai import AsyncOpenAI
# import time
# import json
# from typing import Dict, Any, List
# from app.core.config import settings
# from datetime import datetime

# class AIService:
#     """Service for AI-powered review analysis"""
    
#     def __init__(self):
#         """Initialize OpenAI client"""
#         self.client = AsyncOpenAI(api_key=settings.openai_api_key)
#         self.model = settings.openai_model
    
#     async def analyze_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
#         """
#         Analyze a single review and extract insights
        
#         Args:
#             review: Review data dictionary
            
#         Returns:
#             Dictionary containing extracted insights
#         """
#         start_time = time.time()
        
#         try:
#             # Prepare the prompt for analysis
#             prompt = self._create_analysis_prompt(review)
            
#             # Call OpenAI API
#             response = await self._call_openai_api(prompt)
            
#             # Parse the response
#             insights = self._parse_ai_response(response)
            
#             # Calculate processing time
#             processing_time = time.time() - start_time
            
#             # Prepare insight data - NO LEADING UNDERSCORES
#             insight_data = {
#                 "review_id": str(review["_id"]),  # Convert ObjectId to string
#                 "sentiment": insights.get("sentiment", "neutral"),
#                 "confidence": insights.get("confidence", 0.5),
#                 "topics": insights.get("topics", []),
#                 "positive_aspects": insights.get("positive_aspects", []),
#                 "negative_aspects": insights.get("negative_aspects", []),
#                 "problems": insights.get("problems", []),
#                 "suggestions": insights.get("suggestions", []),
#                 "keywords": insights.get("keywords", []),
#                 "summary": insights.get("summary", ""),
#                 "processing_time": processing_time,
#                 "ai_model": self.model,
#                 "created_at": time.time(),
#                 "updated_at": time.time()
#             }
            
#             return insight_data
            
#         except Exception as e:
#             print(f"Error analyzing review: {str(e)}")
#             # Return default insight data in case of error
#             return self._create_default_insight(review, str(e))
    
#     def _create_analysis_prompt(self, review: Dict[str, Any]) -> str:
#         """Create a detailed prompt for AI analysis"""
        
#         review_text = review.get("text", "")
#         rating = review.get("rating", "")
        
#         prompt = f"""
#         Analyze the following customer review and extract actionable insights for business decision-making.

#         Review Text: "{review_text}"
#         Rating: {rating}

#         Please provide a comprehensive analysis in the following JSON format:

#         {{
#             "sentiment": "positive|negative|neutral",
#             "confidence": 0.0-1.0,
#             "topics": ["topic1", "topic2", "topic3"],
#             "positive_aspects": ["what customers liked"],
#             "negative_aspects": ["what customers disliked"],
#             "problems": ["specific problems mentioned"],
#             "suggestions": ["actionable suggestions for improvement"],
#             "keywords": ["key terms and phrases"],
#             "summary": "Brief summary of the review and key insights"
#         }}

#         Guidelines:
#         1. Be specific and actionable in your analysis
#         2. Identify clear problems and potential solutions
#         3. Extract topics that are relevant to business operations
#         4. Focus on insights that can drive business decisions
#         5. Ensure the sentiment analysis is accurate based on the content
#         6. Provide confidence scores based on clarity of sentiment indicators

#         Respond only with valid JSON, no additional text.
#         """
        
#         return prompt
    
#     async def _call_openai_api(self, prompt: str) -> str:
#         """Call OpenAI API with the given prompt"""
#         try:
#             response = await self.client.chat.completions.create(
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": "You are an expert business analyst specializing in customer feedback analysis. Provide accurate, actionable insights in the requested JSON format."},
#                     {"role": "user", "content": prompt}
#                 ],
#                 max_tokens=1000,
#                 temperature=0.3
#             )
            
#             return response.choices[0].message.content.strip()
            
#         except Exception as e:
#             print(f"OpenAI API error: {str(e)}")
#             raise
    
#     def _parse_ai_response(self, response: str) -> Dict[str, Any]:
#         """Parse the AI response and extract structured data"""
#         try:
#             # Clean the response (remove any markdown formatting)
#             response = response.replace("```json", "").replace("```", "").strip()
            
#             # Parse JSON
#             insights = json.loads(response)
            
#             # Validate and clean the data
#             return {
#                 "sentiment": insights.get("sentiment", "neutral").lower(),
#                 "confidence": float(insights.get("confidence", 0.5)),
#                 "topics": insights.get("topics", []),
#                 "positive_aspects": insights.get("positive_aspects", []),
#                 "negative_aspects": insights.get("negative_aspects", []),
#                 "problems": insights.get("problems", []),
#                 "suggestions": insights.get("suggestions", []),
#                 "keywords": insights.get("keywords", []),
#                 "summary": insights.get("summary", "")
#             }
            
#         except json.JSONDecodeError as e:
#             print(f"JSON parsing error: {str(e)}")
#             print(f"Response was: {response}")
#             return self._create_fallback_insights(response)
#         except Exception as e:
#             print(f"Error parsing AI response: {str(e)}")
#             return self._create_fallback_insights(response)
    
#     def _create_fallback_insights(self, response: str) -> Dict[str, Any]:
#         """Create fallback insights when AI response parsing fails"""
#         return {
#             "sentiment": "neutral",
#             "confidence": 0.3,
#             "topics": ["general"],
#             "positive_aspects": [],
#             "negative_aspects": [],
#             "problems": [],
#             "suggestions": [],
#             "keywords": [],
#             "summary": f"Analysis failed. Raw response: {response[:200]}..."
#         }
    
#     def _create_default_insight(self, review: Dict[str, Any], error: str) -> Dict[str, Any]:
#         """Create default insight data when analysis fails"""
#         return {
#             "review_id": str(review["_id"]),
#             "sentiment": "neutral",
#             "confidence": 0.1,
#             "topics": ["error"],
#             "positive_aspects": [],
#             "negative_aspects": [],
#             "problems": [f"Analysis error: {error}"],
#             "suggestions": ["Review AI service configuration"],
#             "keywords": [],
#             "summary": f"Failed to analyze review due to error: {error}",
#             "processing_time": 0.0,
#             "ai_model": self.model,
#             "created_at": datetime.utcnow(),
#             "updated_at": datetime.utcnow(),
#         }

# I'm currently updating the AI service to use Groq instead of OpenAI. Here's the revised code:
from groq import Groq
from datetime import datetime
import time
import json
from typing import Dict, Any, List
from app.core.config import settings

class AIService:
    """Service for AI-powered review analysis using Groq"""

    def __init__(self):
        """Initialize Groq client"""
        self.client = Groq(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def analyze_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        try:
            prompt = self._create_analysis_prompt(review)

            # Correct Groq API call
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a business analyst."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )

            # Correct Groq response access
            response_text = response.choices[0].message.content

            insights = self._parse_ai_response(response_text)
            return self._build_insight(review, insights, start_time)

        except Exception as e:
            print(f"Groq API error: {str(e)}")
            return self._create_default_insight(review, str(e))

    def _create_analysis_prompt(self, review: Dict[str, Any]) -> str:
        review_text = review.get("text", "")
        rating = review.get("rating", "")
        return f"""
        Analyze the following customer review and extract actionable insights.

        Review Text: "{review_text}"
        Rating: {rating}

        Respond only in valid JSON format with the following exact keys:
        - sentiment (string: positive, negative, or neutral)
        - confidence (float between 0.0 and 1.0)
        - topics (array of strings)
        - positive_aspects (array of strings)
        - negative_aspects (array of strings)
        - problems (array of strings)
        - suggestions (array of strings)
        - keywords (array of strings)
        - summary (string)

        Example response format:
        {{
            "sentiment": "positive",
            "confidence": 0.85,
            "topics": ["product quality", "shipping"],
            "positive_aspects": ["fast delivery", "good quality"],
            "negative_aspects": [],
            "problems": [],
            "suggestions": [],
            "keywords": ["delivery", "quality"],
            "summary": "Customer is happy with the product quality and fast shipping"
        }}
        """

    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        try:
            # Clean the response by removing code blocks
            response = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(response)
            
            # Validate and ensure proper data types
            return {
                "sentiment": data.get("sentiment", "neutral").lower(),
                "confidence": min(max(float(data.get("confidence", 0.5)), 0.0), 1.0),
                "topics": self._ensure_list(data.get("topics", [])),
                "positive_aspects": self._ensure_list(data.get("positive_aspects", [])),
                "negative_aspects": self._ensure_list(data.get("negative_aspects", [])),
                "problems": self._ensure_list(data.get("problems", [])),
                "suggestions": self._ensure_list(data.get("suggestions", [])),
                "keywords": self._ensure_list(data.get("keywords", [])),
                "summary": str(data.get("summary", "")).strip()
            }
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response[:500]}...")
            return self._create_fallback_insights(response)
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return self._create_fallback_insights(response)

    def _ensure_list(self, value: Any) -> List[str]:
        """Ensure the value is a list of strings"""
        if isinstance(value, list):
            return [str(item) for item in value]
        elif isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
            except:
                return [item.strip() for item in value.split(",") if item.strip()]
        return []

    def _build_insight(self, review: Dict[str, Any], insights: Dict[str, Any], start_time: float) -> Dict[str, Any]:
        now = datetime.utcnow()
        return {
            "review_id": str(review["_id"]),
            "sentiment": insights.get("sentiment", "neutral"),
            "confidence": insights.get("confidence", 0.5),
            "topics": insights.get("topics", []),
            "positive_aspects": insights.get("positive_aspects", []),
            "negative_aspects": insights.get("negative_aspects", []),
            "problems": insights.get("problems", []),
            "suggestions": insights.get("suggestions", []),
            "keywords": insights.get("keywords", []),
            "summary": insights.get("summary", ""),
            "processing_time": time.time() - start_time,
            "ai_model": self.model,
            "created_at": now,
            "updated_at": now
        }

    def _create_fallback_insights(self, response: str) -> Dict[str, Any]:
        """Create fallback insights when parsing fails"""
        return {
            "sentiment": "neutral",
            "confidence": 0.3,
            "topics": ["general"],
            "positive_aspects": [],
            "negative_aspects": [],
            "problems": ["AI response parsing failed"],
            "suggestions": ["Manual review recommended"],
            "keywords": [],
            "summary": f"Analysis completed but parsing failed. Response: {response[:200]}..."
        }

    def _create_default_insight(self, review: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Create default insight when API call fails"""
        now = datetime.utcnow()
        return {
            "review_id": str(review["_id"]),
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
            "created_at": now,
            "updated_at": now,
        }

    async def batch_analyze_reviews(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze multiple reviews in batch"""
        insights = []
        for review in reviews:
            try:
                insight = await self.analyze_review(review)
                insights.append(insight)
                print(f"Successfully analyzed review: {review.get('_id')}")
            except Exception as e:
                print(f"Failed to analyze review {review.get('_id')}: {str(e)}")
                insights.append(self._create_default_insight(review, str(e)))
        return insights