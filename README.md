# 🤖 AI-Powered Customer Review Insights

A comprehensive full-stack application that leverages AI to analyze customer reviews and extract actionable insights for businesses. Built with FastAPI, React, and MongoDB, this platform provides sentiment analysis, topic extraction, and intelligent recommendations.

## 🌟 Features

### 📊 **Analytics Dashboard**
- **Real-time Analytics**: Live sentiment distribution, topic trends, and review metrics
- **Interactive Charts**: Beautiful visualizations using Chart.js and Recharts
- **Comprehensive Metrics**: Total reviews, analysis confidence, and trend analysis

### 🧠 **AI-Powered Analysis**
- **Sentiment Analysis**: Automatic classification of reviews as positive, negative, or neutral
- **Topic Extraction**: Intelligent identification of key themes and topics
- **Confidence Scoring**: AI confidence levels for each analysis
- **Batch Processing**: Analyze multiple reviews simultaneously

### 🔍 **Review Management**
- **CRUD Operations**: Create, read, update, and delete reviews
- **Advanced Filtering**: Filter by sentiment, topic, date, and analysis status
- **Bulk Operations**: Batch analysis and management capabilities
- **Real-time Updates**: Live status updates and notifications

### 💡 **Intelligent Insights**
- **Actionable Recommendations**: AI-generated business improvement suggestions
- **Trend Analysis**: Historical data analysis and pattern recognition
- **Priority Scoring**: High, medium, and low priority insights
- **Business Intelligence**: Comprehensive analytics for decision-making

### 🚀 **Modern Tech Stack**
- **Backend**: FastAPI with async/await support
- **Frontend**: React 19 with modern hooks and components
- **Database**: MongoDB with Motor for async operations
- **AI Integration**: Groq API with Llama 3.1 model
- **Containerization**: Docker and Docker Compose for easy deployment

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **MongoDB** - NoSQL database for flexible data storage
- **Motor** - Async MongoDB driver
- **Groq API** - High-performance AI inference
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and development server
- **Bootstrap 5** - Responsive CSS framework
- **Chart.js** - Interactive charts and graphs
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **Mongo Express** - Database administration UI

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Node.js 18+** (for local development)
- **Python 3.11+** (for local development)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/talhashafeeq-coder/AI-Powered-Customer-Review-Insights.git
cd ai-powered-review-insights
```

### 2. Environment Setup
```bash
# Copy environment templates
cp env.example .env
cp backend/env.example backend/.env

# Edit the files with your configuration
nano .env
nano backend/.env
```

**Required Environment Variables:**
```env
# .env (root)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# backend/.env
MONGODB_URL=mongodb://admin:password@mongodb:27017/review_insights?authSource=admin
DATABASE_NAME=review_insights
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
DEBUG=False
```

### 3. Run with Docker Compose
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/api/docs
- **Database Admin**: http://localhost:8081 (admin/admin)

## 📚 API Documentation

### Core Endpoints

#### Reviews Management
```http
GET    /api/reviews/              # Get all reviews
POST   /api/reviews/              # Create new review
GET    /api/reviews/{id}          # Get specific review
PUT    /api/reviews/{id}          # Update review
DELETE /api/reviews/{id}          # Delete review
POST   /api/reviews/{id}/analyze  # Analyze review with AI
```

#### AI Insights
```http
GET    /api/insights/                    # Get all insights
GET    /api/insights/{id}                # Get specific insight
POST   /api/insights/batch-analyze       # Batch analyze reviews
GET    /api/insights/by-sentiment/{sentiment}  # Filter by sentiment
GET    /api/insights/by-topic/{topic}    # Filter by topic
DELETE /api/insights/{id}                # Delete insight
```

#### Analytics
```http
GET    /api/analytics/summary            # Comprehensive analytics
GET    /api/analytics/sentiment          # Sentiment breakdown
GET    /api/analytics/topics             # Topic analytics
GET    /api/analytics/trends             # Trend analysis
GET    /api/analytics/recommendations    # AI recommendations
GET    /api/analytics/dashboard          # Complete dashboard data
```

### Example API Usage

#### Create a Review
```bash
curl -X POST "http://localhost:8001/api/reviews/" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Amazing product! Fast delivery and excellent quality.",
    "rating": 5,
    "source": "website",
    "customer_name": "John Doe"
  }'
```

#### Analyze Review
```bash
curl -X POST "http://localhost:8001/api/reviews/{review_id}/analyze"
```

#### Get Analytics Summary
```bash
curl -X GET "http://localhost:8001/api/analytics/summary"
```

## 🏗️ Project Structure

```
ai-powered-review-insights/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/              # Configuration and settings
│   │   ├── models/            # Pydantic models
│   │   ├── routers/           # API route handlers
│   │   ├── services/          # Business logic and AI integration
│   │   └── database.py        # MongoDB connection
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # React frontend
│   └── review_ai_frontend/
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── services/      # API client
│       │   └── assets/        # Static assets
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml         # Multi-container setup
├── .gitignore                 # Git ignore rules
└── README.md
```

## 🔧 Development

### Local Development Setup

#### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Development
```bash
cd frontend/review_ai_frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both root and backend directories:

**Root `.env`:**
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

**Backend `.env`:**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=review_insights
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
DEBUG=True
ALLOWED_ORIGINS=["http://localhost:3000"]
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Container Services
- **MongoDB**: Database server on port 27017
- **Backend**: FastAPI server on port 8001
- **Frontend**: React app served by Nginx on port 8080
- **Mongo Express**: Database admin on port 8081

## 📊 Features in Detail

### AI Analysis Capabilities
- **Sentiment Classification**: Positive, negative, neutral with confidence scores
- **Topic Extraction**: Automatic identification of key themes and subjects
- **Confidence Scoring**: AI confidence levels for each analysis
- **Batch Processing**: Efficient analysis of multiple reviews

### Analytics Dashboard
- **Real-time Metrics**: Live updates of review statistics
- **Sentiment Distribution**: Visual breakdown of sentiment categories
- **Topic Trends**: Most frequently mentioned topics
- **Historical Trends**: Time-based analysis and patterns
- **Recommendations**: AI-generated business improvement suggestions

### Review Management
- **Comprehensive CRUD**: Full create, read, update, delete operations
- **Advanced Filtering**: Filter by sentiment, topic, date, and more
- **Bulk Operations**: Process multiple reviews simultaneously
- **Status Tracking**: Monitor analysis progress and status

## 🔒 Security & Best Practices

- **Environment Variables**: All sensitive data stored in environment variables
- **CORS Configuration**: Properly configured for production deployment
- **Input Validation**: Pydantic models ensure data integrity
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Built-in rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing fast AI inference capabilities
- **FastAPI** for the excellent async web framework
- **React** team for the amazing frontend library
- **MongoDB** for flexible document storage

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/api/docs`
- Review the Docker logs for troubleshooting

---

**Built with ❤️ for modern businesses seeking intelligent customer insights**
