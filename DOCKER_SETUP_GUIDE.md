# Docker Setup Guide

This guide explains how to configure your AI-Powered Customer Review Insights project for Docker deployment.

## 📦 What's Been Configured

### 1. Environment Configuration Files

- **`env.example`** - Main environment template with all required variables
- **`backend/env.example`** - Updated to match actual Groq configuration (was incorrectly using OpenAI)

### 2. Setup Scripts

- **`setup.sh`** - Linux/macOS setup script
- **`setup.bat`** - Windows setup script

### 3. Documentation

- **`README.md`** - Comprehensive setup and usage guide
- **`DOCKER_SETUP_GUIDE.md`** - This file explaining the Docker configuration

## 🔧 Key Environment Variables

The following variables need to be configured by users:

### Required
- `GROQ_API_KEY` - Get from https://console.groq.com/

### Optional (with defaults)
- `MONGO_INITDB_ROOT_USERNAME` (default: admin)
- `MONGO_INITDB_ROOT_PASSWORD` (default: secure_password_123)
- `MONGO_INITDB_DATABASE` (default: review_insights)
- `GROQ_MODEL` (default: llama-3.1-8b-instant)
- `DEBUG` (default: False)
- `MAX_REQUESTS_PER_MINUTE` (default: 60)
- `ME_CONFIG_BASICAUTH_USERNAME` (default: admin)
- `ME_CONFIG_BASICAUTH_PASSWORD` (default: admin123)

## 🚀 User Instructions

Users can now easily set up the project by:

1. **Quick Setup (Recommended)**:
   ```bash
   # Linux/macOS
   ./setup.sh
   
   # Windows
   setup.bat
   ```

2. **Manual Setup**:
   ```bash
   cp env.example .env
   # Edit .env with their API key
   docker-compose up -d
   ```

## 🌐 Application URLs

Once running, users can access:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs
- Database Admin: http://localhost:8081

## 📋 Docker Services

The `docker-compose.yml` includes:
- **Frontend**: React app with Nginx (port 8080)
- **Backend**: FastAPI application (port 8001)
- **MongoDB**: Database server (port 27017)
- **Mongo Express**: Database admin UI (port 8081)

## 🔄 Next Steps for Production

To deploy using your Docker Hub image:

1. Update `docker-compose.yml` to use your published image instead of building locally
2. Replace `build: ./backend` with `image: your-username/review-insights-backend:latest`
3. Replace `build: ./frontend/review_ai_frontend` with `image: your-username/review-insights-frontend:latest`

Example production docker-compose.yml:
```yaml
services:
  backend:
    image: your-username/review-insights-backend:latest
    # ... rest of configuration
  frontend:
    image: your-username/review-insights-frontend:latest
    # ... rest of configuration
```

## 📝 Files Created/Modified

1. **`env.example`** - Created comprehensive environment template
2. **`backend/env.example`** - Fixed to use Groq instead of OpenAI
3. **`README.md`** - Complete setup and usage guide
4. **`setup.sh`** - Linux/macOS setup script
5. **`setup.bat`** - Windows setup script
6. **`DOCKER_SETUP_GUIDE.md`** - This summary document

Your project is now ready for easy Docker deployment! Users can pull your Docker images and run the project with minimal configuration.
