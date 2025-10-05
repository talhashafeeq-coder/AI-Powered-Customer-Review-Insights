#!/bin/bash

# AI-Powered Customer Review Insights - Setup Script
# This script helps users quickly set up the application

set -e

echo "🚀 Setting up AI-Powered Customer Review Insights..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file and add your GROQ_API_KEY"
    echo "   Get your free API key at: https://console.groq.com/"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
else
    echo "✅ .env file already exists"
fi

# Check if GROQ_API_KEY is set
if grep -q "your_groq_api_key_here" .env; then
    echo "⚠️  WARNING: You haven't set your GROQ_API_KEY yet!"
    echo "   Please edit the .env file and replace 'your_groq_api_key_here' with your actual API key"
    echo "   Get your free API key at: https://console.groq.com/"
    echo ""
    read -p "Press Enter after you've updated your GROQ_API_KEY..."
fi

echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🎉 Setup complete! Your application is now running:"
echo ""
echo "   🌐 Frontend:        http://localhost:8080"
echo "   🔧 Backend API:     http://localhost:8001"
echo "   📚 API Docs:        http://localhost:8001/docs"
echo "   🗄️  Database Admin:  http://localhost:8081 (admin/admin123)"
echo ""
echo "📊 View logs with: docker-compose logs -f"
echo "🛑 Stop with: docker-compose down"
echo ""
echo "Happy analyzing! 🚀"
