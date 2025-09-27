"""
AI-Powered Customer Review Insights - FastAPI Main Application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import reviews, insights, analytics
from app.database import connect_to_mongo, close_mongo_connection
from app.core.config import settings

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI-Powered Customer Review Insights API",
    description="Extract actionable insights from customer reviews using AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

# Mount static files for frontend (if directory exists)
import os
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongo_connection()

# @app.get("/", response_class=HTMLResponse)
# async def read_root():
#     """Serve the main dashboard"""
#     return """
#     <!DOCTYPE html>
#     <html>
#     <head>
#         <title>AI-Powered Customer Review Insights</title>
#         <meta charset="utf-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1">
#         <style>
#             body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
#             .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
#             h1 { color: #333; text-align: center; margin-bottom: 30px; }
#             .nav { display: flex; gap: 20px; margin-bottom: 30px; justify-content: center; }
#             .nav a { padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
#             .nav a:hover { background: #0056b3; }
#             .feature { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px; }
#             .api-link { color: #007bff; text-decoration: none; }
#             .api-link:hover { text-decoration: underline; }
#         </style>
#     </head>
#     <body>
#         <div class="container">
#             <h1>🤖 AI-Powered Customer Review Insights</h1>
#             <div class="nav">
#                 <a href="/api/docs">API Documentation</a>
#                 <a href="/api/analytics/summary">View Analytics</a>
#                 <a href="/static/dashboard.html">Interactive Dashboard</a>
#             </div>
            
#             <div class="feature">
#                 <h3>📊 Features</h3>
#                 <ul>
#                     <li><strong>Review Management:</strong> <a href="/api/reviews" class="api-link">Manage customer reviews</a></li>
#                     <li><strong>AI Insights:</strong> <a href="/api/insights" class="api-link">Extract actionable insights</a></li>
#                     <li><strong>Analytics:</strong> <a href="/api/analytics/sentiment" class="api-link">View sentiment analysis</a></li>
#                     <li><strong>Real-time Processing:</strong> Process reviews and extract insights instantly</li>
#                 </ul>
#             </div>
            
#             <div class="feature">
#                 <h3>🚀 Quick Start</h3>
#                 <p>1. Add a review: <code>POST /api/reviews</code></p>
#                 <p>2. Analyze insights: <code>POST /api/reviews/{id}/analyze</code></p>
#                 <p>3. View analytics: <code>GET /api/analytics/summary</code></p>
#             </div>
            
#             <div class="feature">
#                 <h3>📚 API Documentation</h3>
#                 <p>Complete API documentation is available at <a href="/api/docs" class="api-link">/api/docs</a></p>
#             </div>
#         </div>
#     </body>
#     </html>
#     """

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "AI-Powered Customer Review Insights API is running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
