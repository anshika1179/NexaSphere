# Stage 1: Install production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline

# Stage 2: Production runtime image
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (excluding .env, test files, etc. via .dockerignore)
COPY . .

# Port is read from the PORT env variable at runtime (defaults to 8787).
# Render/Railway automatically sets PORT=10000.
EXPOSE 8787

# Health check — lets Docker know the container is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8787}/health || exit 1

CMD ["node", "index.js"]
