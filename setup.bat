@echo off
REM AI-Powered Customer Review Insights - Windows Setup Script
REM This script helps users quickly set up the application on Windows

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
echo 🐳 Starting Docker services...
docker-compose up -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 Setup complete! Your application is now running:
echo.
echo    🌐 Frontend:        http://localhost:8080
echo    🔧 Backend API:     http://localhost:8001
echo    📚 API Docs:        http://localhost:8001/docs
echo    🗄️  Database Admin:  http://localhost:8081 (admin/admin123)
echo.
echo 📊 View logs with: docker-compose logs -f
echo 🛑 Stop with: docker-compose down
echo.
echo Happy analyzing! 🚀
pause
