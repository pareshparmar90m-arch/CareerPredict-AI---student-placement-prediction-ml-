# Stage 1: Build React frontend application using Node
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install packages
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

# Copy frontend source code and build production bundles
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve static production assets with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
