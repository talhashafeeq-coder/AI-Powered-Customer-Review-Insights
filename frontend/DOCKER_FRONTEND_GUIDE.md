## Frontend (Vite React) – Docker & Operations Guide

### Overview
This document explains how the React frontend is organized, how to build and run it in Docker, and how it communicates with the backend.

### Tech Stack
- Vite + React 19
- React-Bootstrap + Bootstrap 5
- Recharts
- Axios
- Font Awesome

### Key Files
- `frontend/review_ai_frontend/package.json`: scripts and dependencies (`dev`, `build`, `preview`)
- `frontend/review_ai_frontend/src/App.jsx`: routing
- `frontend/review_ai_frontend/src/pages/*`: main pages (Dashboard, Reviews, Insights, Analytics, AddReview)
- `frontend/review_ai_frontend/src/components/*`: NavBar, Header, FilterSidebar, shared styles
- `frontend/review_ai_frontend/src/services/api.js`: Axios API base and endpoints
- `frontend/review_ai_frontend/Dockerfile`: multi-stage build (Node build, Nginx serve)
- `frontend/review_ai_frontend/nginx.conf`: SPA routing config

### API Base URL
Currently set in `src/services/api.js` as:
```
const API_BASE = "http://localhost:8000/api";
```
When running via Docker Compose on the same host, this works in the browser. For more flexible deployments, consider switching to `import.meta.env.VITE_API_BASE` and passing `VITE_API_BASE` at build time.

### Local Development (without Docker)
1. `cd frontend/review_ai_frontend`
2. `npm ci`
3. `npm run dev`
4. Open Vite dev server URL shown in the terminal (default `http://localhost:5173`).

### Docker Build & Run (single service)
1. Build: `docker build -t review-ai-frontend:latest ./frontend/review_ai_frontend`
2. Run: `docker run --rm -p 8080:80 review-ai-frontend:latest`
3. App: `http://localhost:8080`

### Docker Compose
The root `docker-compose.yml` includes a `frontend` service that depends on `backend`.
- Start everything: `docker compose up -d --build`
- Frontend is served at `http://localhost:8080`

### Routing & Pages
- `/dashboard` (default `/`) shows KPIs, charts, insights, and a detailed table.
- `/reviews` & `/insights` use a permanent left sidebar for filters and content to the right.
- `/add-review` provides a styled form and live preview.

### Notes & Tips
- Charts and tables have improved readability and tooltips.
- Sidebar filters stay visible on the left (no need to scroll past filters).
- For production behind a reverse proxy, adapt Nginx caching headers as needed in `nginx.conf`.


