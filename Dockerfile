# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --legacy-peer-deps

# ── Stage 2: Build shared package ──
FROM deps AS shared-build
WORKDIR /app
COPY packages/shared/ ./packages/shared/
COPY tsconfig.base.json ./

# ── Stage 3: Build API ──
FROM shared-build AS api-build
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npx tsc || true

# ── Stage 4: Build Web ──
FROM shared-build AS web-build
COPY apps/web/ ./apps/web/
WORKDIR /app/apps/web
RUN npm run build

# ── Stage 5: Production image ──
FROM node:20-alpine AS production
WORKDIR /app

# Copy everything needed
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=api-build /app/apps/api ./apps/api
COPY --from=api-build /app/packages/shared ./packages/shared
COPY --from=api-build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=web-build /app/apps/web/dist ./apps/web/dist
COPY --from=shared-build /app/tsconfig.base.json ./

# Install serve for static files
RUN npm install -g serve

# Create start script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/apps/api && npx prisma migrate deploy && cd /app' >> /app/start.sh && \
    echo 'cd /app/apps/api && node --loader tsx src/index.ts &' >> /app/start.sh && \
    echo 'serve -s /app/apps/web/dist -l 5173 &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000 5173

CMD ["/app/start.sh"]
