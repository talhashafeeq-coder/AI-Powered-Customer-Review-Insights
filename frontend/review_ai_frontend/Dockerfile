# Multi-stage build for Vite React app

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 2) Production stage (Nginx)
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default content
RUN rm -rf ./*

# Copy built assets
COPY --from=builder /app/dist ./

# Add nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173 80
CMD ["nginx", "-g", "daemon off;"]


