# AI-Powered Customer Review Insights

A full-stack application that uses AI to analyze customer reviews and generate actionable insights. Built with FastAPI (backend), React (frontend), MongoDB (database), and powered by Groq AI.

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/get-started)
- [Groq API Key](https://console.groq.com/) (free tier available)

### Option 1: Using Pre-built Docker Image (Recommended)

```bash
# 1. Download files
curl -O https://raw.githubusercontent.com/talhashafeeq-coder/AI-Powered-Customer-Review-Insights/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/talhashafeeq-coder/AI-Powered-Customer-Review-Insights/main/env.example

# 2. Configure environment
cp env.example .env
# Edit .env with your GROQ_API_KEY

# 3. Run application
docker-compose up -d
```

### Option 2: Development Setup (Build from Source)

```bash
# Clone repository
git clone https://github.com/talhashafeeq-coder/AI-Powered-Customer-Review-Insights.git
cd AI-Powered-Customer-Review-Insights

# Configure environment
cp env.example .env
# Edit .env with your GROQ_API_KEY

# Run with Docker Compose
docker-compose up -d
```

## 🌐 Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/api/docs

## 📋 Environment Variables

### Required
- `GROQ_API_KEY` - Get from https://console.groq.com/

### Optional
- `GROQ_MODEL` - AI model (default: llama-3.1-8b-instant)
- `DEBUG` - Debug mode (default: False)
- `DATABASE_NAME` - Database name (default: review_insights)

## 🛠️ Features

- ✅ Real-time Review Analysis
- ✅ Sentiment Classification  
- ✅ Trend Detection
- ✅ Actionable Insights Generation
- ✅ RESTful API
- ✅ Interactive Dashboard

## 📚 Documentation

- [Complete Setup Guide](CLIENT_SETUP_GUIDE.md)
- [Environment Configuration](ENVIRONMENT_CONFIGURATION_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Made with ❤️ for developers who want to understand their customers better**