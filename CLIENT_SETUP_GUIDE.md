# 🚀 Client Setup Guide

This guide shows your clients exactly how to run your AI-Powered Customer Review Insights application.

## 📋 What Your Client Needs

1. **Docker Desktop** (installed on their computer)
2. **Groq API Key** (free from https://console.groq.com/)
3. **Two files** (you'll send them these)

## 📁 Files to Send to Your Client

Send your client these **two files**:

1. **`docker-compose.yml`** - Configuration file
2. **`env.example`** - Environment template

## 🔧 Client Setup Instructions (Send This to Your Client)

### Step 1: Download Files
```bash
# Create a folder for the project
mkdir review-insights
cd review-insights

# Download the files (you'll provide these URLs)
curl -O [YOUR_GITHUB_URL]/docker-compose.yml
curl -O [YOUR_GITHUB_URL]/env.example
```

### Step 2: Configure Environment
```bash
# Copy the environment template
cp env.example .env

# Edit the .env file with your Groq API key
# Replace 'your_groq_api_key_here' with your actual API key
```

**Required:** Get your free Groq API key from https://console.groq.com/

### Step 3: Run the Application
```bash
# Start the application
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/api/docs

### Stop the Application
```bash
docker-compose down
```

## ⚠️ Important Notes for Your Client

1. **API Key Required**: They MUST provide a valid Groq API key
2. **Ports**: Make sure ports 8080, 8001, and 27017 are not in use
3. **Docker**: Docker Desktop must be running

## 🆘 Troubleshooting for Your Client

### "GROQ_API_KEY is required" Error
- Make sure they've set their API key in the `.env` file
- Verify the API key starts with `gsk_`

### Port Conflicts
- Stop other applications using ports 8080, 8001, or 27017
- Or modify the ports in `docker-compose.yml`

### Container Won't Start
- Check Docker Desktop is running
- Run `docker-compose logs` to see error messages

## 📞 Support

If your client has issues, they can:
1. Check the logs: `docker-compose logs`
2. Verify their `.env` file configuration
3. Contact you for support

---

**That's it! Your client just needs these two files and their Groq API key.**
