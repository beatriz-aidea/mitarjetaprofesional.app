# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and server file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./

# Variables de entorno por defecto (Cloud Run inyectará el PORT)
ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
