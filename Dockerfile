# Use Node.js runtime image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and install dependencies
COPY package.json bun.lock* ./
RUN npm install -g bun && bun install

# Copy source files and build
COPY . .
RUN bun run build

# Production stage using Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
