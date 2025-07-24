# Multi-stage build for Azure Icons Viewer
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY icon-viewer/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY icon-viewer/ ./

# Copy icons to public directory
COPY Azure_Public_Service_Icons/Icons/ ./public/icons/

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
