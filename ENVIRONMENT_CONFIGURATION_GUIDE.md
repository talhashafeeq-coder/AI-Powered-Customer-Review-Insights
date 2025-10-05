# 🔧 Environment Configuration Guide

This guide explains how to properly configure environment variables for the AI-Powered Customer Review Insights application when using Docker Compose.

## 📋 Overview

The application supports multiple deployment modes:
1. **Multi-container setup** (docker-compose.yml) - Separate containers for each service
2. **Single-container setup** (docker-compose-complete.yml) - All services in one container
3. **Development setup** - Local development with Docker

## 🔑 Required Environment Variables

### Core Application Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| GROQ_API_KEY | Groq API key for AI inference | ✅ **Yes** | - | gsk_1234... |
| GROQ_MODEL | AI model to use | ❌ No | llama-3.1-8b-instant | llama-3.1-8b-instant |
| MONGODB_URL | MongoDB connection string | ❌ No | mongodb://localhost:27017 | mongodb://admin:password@mongodb:27017/review_insights?authSource=admin |
| DATABASE_NAME | MongoDB database name | ❌ No | review_insights | review_insights |
| DEBUG | Enable debug mode | ❌ No | False | True or False |

### MongoDB Configuration Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| MONGO_INITDB_ROOT_USERNAME | MongoDB root username | ❌ No | admin | admin |
| MONGO_INITDB_ROOT_PASSWORD | MongoDB root password | ❌ No | password | your_secure_password |
| MONGO_INITDB_DATABASE | Initial database name | ❌ No | review_insights | review_insights |

### Mongo Express Configuration Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| ME_CONFIG_MONGODB_ADMINUSERNAME | Mongo Express admin username | ❌ No | admin | admin |
| ME_CONFIG_MONGODB_ADMINPASSWORD | Mongo Express admin password | ❌ No | password | your_secure_password |
| ME_CONFIG_MONGODB_URL | MongoDB URL for Mongo Express | ❌ No | mongodb://admin:password@mongodb:27017/ | mongodb://admin:password@mongodb:27017/ |
| ME_CONFIG_BASICAUTH_USERNAME | Mongo Express web auth username | ❌ No | admin | admin |
| ME_CONFIG_BASICAUTH_PASSWORD | Mongo Express web auth password | ❌ No | admin | your_web_password |

### Application Configuration Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| ALLOWED_ORIGINS | CORS allowed origins | ❌ No | ["*"] | ["http://localhost:3000", "https://yourdomain.com"] |
| MAX_REQUESTS_PER_MINUTE | Rate limiting | ❌ No | 60 | 100 |

## 🚀 Setup Instructions

### Step 1: Create Environment Files

Create the following files in your project root:

#### .env (Root Level)
```bash
# ===========================================
# GROQ AI CONFIGURATION (REQUIRED)
# ===========================================
# Get your free API key from: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Optional: Override default AI model
GROQ_MODEL=llama-3.1-8b-instant

# ===========================================
# MONGODB CONFIGURATION
# ===========================================
# MongoDB connection settings
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password
MONGO_INITDB_DATABASE=review_insights

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
# Application settings
DEBUG=False
ALLOWED_ORIGINS=["*"]
MAX_REQUESTS_PER_MINUTE=60

# ===========================================
# MONGO EXPRESS CONFIGURATION
# ===========================================
# Database admin interface settings
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=your_web_password
```

#### backend/.env (Backend Specific)
```bash
# ===========================================
# GROQ AI CONFIGURATION (REQUIRED)
# ===========================================
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# ===========================================
# MONGODB CONFIGURATION
# ===========================================
# For Docker Compose, use service name 'mongodb'
MONGODB_URL=mongodb://admin:your_secure_password@mongodb:27017/review_insights?authSource=admin
DATABASE_NAME=review_insights

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
DEBUG=False
ALLOWED_ORIGINS=["*"]
MAX_REQUESTS_PER_MINUTE=60
```

### Step 2: Get Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and replace `your_groq_api_key_here` in your .env files

### Step 3: Configure MongoDB Credentials

Replace the following placeholders with your own secure values:
- `your_secure_password` - Choose a strong password for MongoDB
- `your_web_password` - Choose a password for Mongo Express web interface

### Step 4: Choose Your Deployment Mode

#### Option A: Multi-Container Setup (Recommended for Development)
```bash
# Use the main docker-compose.yml
docker-compose up -d --build
```

#### Option B: Single-Container Setup (Recommended for Production)
```bash
# Use the complete docker-compose file
docker-compose -f docker-compose-complete.yml up -d
```

## 🔒 Security Best Practices

### 1. Environment File Security
- **Never commit .env files to version control**
- Use strong, unique passwords for all services
- Rotate API keys regularly
- Use different passwords for different environments (dev, staging, production)

### 2. Production Security
```bash
# Production .env example
GROQ_API_KEY=gsk_your_production_api_key
MONGO_INITDB_ROOT_PASSWORD=very_secure_production_password_123!
ME_CONFIG_BASICAUTH_PASSWORD=secure_web_password_456!
DEBUG=False
ALLOWED_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]
```

### 3. Docker Secrets (Advanced)

For production deployments, consider using Docker secrets:

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      GROQ_API_KEY_FILE: /run/secrets/groq_api_key
    secrets:
      - groq_api_key

secrets:
  groq_api_key:
    file: ./secrets/groq_api_key.txt
```

## 🐳 Docker Compose Environment Variable Mapping

### Multi-Container Setup (docker-compose.yml)

```yaml
services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-password}
      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE:-review_insights}

  backend:
    env_file:
      - ./backend/.env
    environment:
      MONGODB_URL: mongodb://${MONGO_INITDB_ROOT_USERNAME:-admin}:${MONGO_INITDB_ROOT_PASSWORD:-password}@mongodb:27017/${DATABASE_NAME:-review_insights}?authSource=admin
      DATABASE_NAME: ${DATABASE_NAME:-review_insights}
      GROQ_API_KEY: ${GROQ_API_KEY}
      GROQ_MODEL: ${GROQ_MODEL:-llama-3.1-8b-instant}
      DEBUG: ${DEBUG:-False}

  mongo-express:
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_INITDB_ROOT_USERNAME:-admin}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-password}
      ME_CONFIG_MONGODB_URL: mongodb://${MONGO_INITDB_ROOT_USERNAME:-admin}:${MONGO_INITDB_ROOT_PASSWORD:-password}@mongodb:27017/
      ME_CONFIG_BASICAUTH_USERNAME: ${ME_CONFIG_BASICAUTH_USERNAME:-admin}
      ME_CONFIG_BASICAUTH_PASSWORD: ${ME_CONFIG_BASICAUTH_PASSWORD:-admin}
```

### Single-Container Setup (docker-compose-complete.yml)

```yaml
services:
  app:
    environment:
      MONGODB_URL: mongodb://localhost:27017
      DATABASE_NAME: ${DATABASE_NAME:-review_insights}
      GROQ_API_KEY: ${GROQ_API_KEY}
      GROQ_MODEL: ${GROQ_MODEL:-llama-3.1-8b-instant}
      DEBUG: ${DEBUG:-False}
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-password}
```

## 🔍 Environment Variable Validation

### Backend Configuration (backend/app/core/config.py)

The application automatically validates environment variables using Pydantic:

```python
class Settings(BaseSettings):
    # Required variables
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    
    # Optional variables with defaults
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    database_name: str = os.getenv("DATABASE_NAME", "review_insights")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
```

### Validation Checklist
- ✅ GROQ_API_KEY is set and valid
- ✅ MongoDB connection string is correct
- ✅ Database name is specified
- ✅ Debug mode is set appropriately for environment

## 🚨 Troubleshooting

### Common Issues

#### 1. "Groq client not initialized" Error

**Problem**: API key is missing or invalid

**Solution**:
```bash
# Check if API key is set
echo $GROQ_API_KEY

# Verify in .env file
cat .env | grep GROQ_API_KEY
```

#### 2. MongoDB Connection Failed

**Problem**: Database connection string is incorrect

**Solution**:
```bash
# Check MongoDB container
docker-compose logs mongodb

# Verify connection string format
# Correct: mongodb://username:password@host:port/database?authSource=admin
```

#### 3. CORS Issues

**Problem**: Frontend can't connect to backend

**Solution**:
```bash
# Update ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=["http://localhost:8080", "http://localhost:3000"]
```

#### 4. Mongo Express Access Denied

**Problem**: Can't access database admin interface

**Solution**:
```bash
# Check credentials in .env
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=your_web_password
```

### Debug Commands

```bash
# Check all environment variables in container
docker-compose exec backend env | grep -E "(GROQ|MONGO|DEBUG)"

# View application logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Test API connectivity
curl http://localhost:8001/api/health

# Check MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 📝 Environment File Templates

### Development Environment
```bash
# .env.dev
GROQ_API_KEY=your_dev_api_key
MONGO_INITDB_ROOT_PASSWORD=dev_password
DEBUG=True
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

### Production Environment
```bash
# .env.prod
GROQ_API_KEY=your_production_api_key
MONGO_INITDB_ROOT_PASSWORD=very_secure_production_password
DEBUG=False
ALLOWED_ORIGINS=["https://yourdomain.com"]
MAX_REQUESTS_PER_MINUTE=100
```

### Testing Environment
```bash
# .env.test
GROQ_API_KEY=your_test_api_key
DATABASE_NAME=review_insights_test
DEBUG=True
MONGO_INITDB_ROOT_PASSWORD=test_password
```

## 🔄 Environment Switching

### Using Different Environment Files
```bash
# Development
cp .env.dev .env
docker-compose up -d

# Production
cp .env.prod .env
docker-compose -f docker-compose-complete.yml up -d

# Testing
cp .env.test .env
docker-compose up -d
```

### Docker Compose Override
```bash
# Create docker-compose.override.yml for local development
version: '3.8'
services:
  backend:
    environment:
      DEBUG: "True"
    volumes:
      - ./backend:/app  # For hot reload
```

## 📚 Additional Resources

- [Groq API Documentation](https://console.groq.com/docs)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Pydantic Settings](https://pydantic-docs.helpmanual.io/usage/settings/)

---

**Need Help?**
- Check the troubleshooting section above
- Review Docker Compose logs: `docker-compose logs`
- Verify your .env file syntax
- Ensure all required variables are set
