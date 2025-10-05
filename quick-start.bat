@echo off
REM AI-Powered Customer Review Insights - Windows Quick Start Script
REM This script helps users quickly set up the application using the pre-built Docker image

echo 🚀 Setting up AI-Powered Customer Review Insights...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first:
    echo    https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first:
    echo    https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
echo.

REM Download required files
echo 📥 Downloading required files...

REM Download docker-compose file
curl -O https://raw.githubusercontent.com/talhashafeeq-coder/AI-Powered-Customer-Review-Insights/main/docker-compose.single-container.yml

REM Download environment template
curl -O https://raw.githubusercontent.com/talhashafeeq-coder/AI-Powered-Customer-Review-Insights/main/env.example

echo ✅ Files downloaded successfully
echo.

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy env.example .env >nul
    echo ✅ Created .env file
    echo.
    echo ⚠️  IMPORTANT: Please edit the .env file and add your GROQ_API_KEY
    echo    Get your free API key at: https://console.groq.com/
    echo.
    pause
) else (
    echo ✅ .env file already exists
)

REM Check if GROQ_API_KEY is set
findstr /C:"your_groq_api_key_here" .env >nul
if not errorlevel 1 (
    echo ⚠️  WARNING: You haven't set your GROQ_API_KEY yet!
    echo    Please edit the .env file and replace 'your_groq_api_key_here' with your actual API key
    echo    Get your free API key at: https://console.groq.com/
    echo.
    pause
)

echo.
echo 🐳 Starting Docker container...
docker-compose -f docker-compose.single-container.yml up -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 Setup complete! Your application is now running:
echo.
echo    🌐 Frontend:        http://localhost:8080
echo    🔧 Backend API:     http://localhost:8001
echo    📚 API Docs:        http://localhost:8001/docs
echo    🗄️  MongoDB:         localhost:27017
echo.
echo 📊 View logs with: docker-compose -f docker-compose.single-container.yml logs -f
echo 🛑 Stop with: docker-compose -f docker-compose.single-container.yml down
echo.
echo Happy analyzing! 🚀
pause
