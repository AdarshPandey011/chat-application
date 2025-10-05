# Multi-stage build for ChatApp
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies for all services
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY services/*/package*.json ./services/*/
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy service files
COPY --from=builder /app/services ./services
COPY --from=builder /app/frontend/dist ./frontend/dist

USER nodejs

EXPOSE 3000 3001 3002 4000

CMD ["npm", "start"]
