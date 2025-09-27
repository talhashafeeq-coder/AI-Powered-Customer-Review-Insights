## Backend (FastAPI) – Docker & Operations Guide

### Overview
This document explains how the FastAPI backend is configured, how to run it in Docker, required environment variables, and how it interacts with MongoDB and the frontend.

### Tech Stack
- FastAPI + Uvicorn
- MongoDB (via Motor)
- Pydantic v2 + pydantic-settings
- OpenAI SDK (optional)

### Key Files
- `backend/app/main.py`: FastAPI app, routers, CORS, and optional static dashboard mount
- `backend/app/core/config.py`: Settings via `pydantic-settings`
- `backend/app/database.py`: Async Mongo connection with graceful fallback
- `backend/app/routers/*.py`: REST endpoints for reviews, insights, analytics
- `backend/app/services/*.py`: AI and analytics services
- `backend/Dockerfile`: Image build for backend service

### Environment Variables
- `MONGODB_URL` (required) – e.g. `mongodb://admin:password@mongodb:27017/review_insights?authSource=admin`
- `DATABASE_NAME` (required) – default used by the app if not set: `review_db`
- `OPENAI_API_KEY` (optional) – if omitted, AI returns dummy insights
- `OPENAI_MODEL` (optional) – default `gpt-3.5-turbo`
- `DEBUG` (optional) – `True`/`False`

You can also use a `.env` file. `pydantic-settings` loads `.env` automatically.

### Running Locally (without Docker)
1. Create venv and install requirements:
   - `python -m venv .venv && . .venv/Scripts/activate` (Windows PowerShell)
   - `pip install -r backend/requirements.txt`
2. Export env vars (or copy `backend/env.example` to `.env`) and run:
   - `cd backend`
   - `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Docker Build & Run (single service)
1. Build: `docker build -t review-ai-backend:latest ./backend`
2. Run: `docker run --rm -p 8000:8000 --env-file backend/.env review-ai-backend:latest`

The backend expects MongoDB reachable at `MONGODB_URL`. Without Mongo, the app still starts but DB features are limited.

### Docker Compose (recommended)
The root `docker-compose.yml` includes `mongodb`, `mongo-express`, `backend`, and `frontend` services. To start all:
- `docker compose up -d --build`

Services:
- API: `http://localhost:8000`
- API docs: `http://localhost:8000/api/docs`
- Mongo Express: `http://localhost:8081`
- Frontend: `http://localhost:8080`

### Health & Endpoints
- Health check: `GET /api/health`
- Reviews: `GET/POST /api/reviews`, `POST /api/reviews/{id}/analyze`
- Insights: `GET /api/insights` and related
- Analytics: `GET /api/analytics/summary`, `GET /api/analytics/sentiment`

### Notes & Tips
- Pydantic v2 migration handled; avoid `__modify_schema__` custom types.
- `model_used` renamed to `ai_model` to avoid protected namespace conflicts.
- Static dashboard auto-mounted only if `backend/static` exists.


