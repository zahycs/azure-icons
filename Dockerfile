# Multi-stage build for Azure Icons Viewer
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY icon-viewer/package*.json ./icon-viewer/

# Install dependencies
WORKDIR /app/icon-viewer
RUN npm ci

# Copy the icon generation script and Azure icons
COPY generate-icon-index.js /app/
COPY Azure_Public_Service_Icons/ /app/Azure_Public_Service_Icons/

# Copy source code
COPY icon-viewer/ /app/icon-viewer/

# Generate icon index
WORKDIR /app
RUN node generate-icon-index.js

# Copy icons to public directory  
RUN cp -r Azure_Public_Service_Icons/Icons/ icon-viewer/public/icons/

# Build the application for Docker (uses .env.docker settings)
WORKDIR /app/icon-viewer
RUN npm run build:docker

# Production stage
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/icon-viewer/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
