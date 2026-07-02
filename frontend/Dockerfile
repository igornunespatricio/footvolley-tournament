FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    \
    location /api { \
    proxy_pass http://backend:3001/api; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection "upgrade"; \
    } \
    \
    location /socket.io { \
    proxy_pass http://backend:3001/socket.io; \
    proxy_http_version 1.1; \
    proxy_buffering off; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection "Upgrade"; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
