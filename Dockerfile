# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-bookworm-slim

# ─── deps stage ────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ─── builder stage ─────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=https://gmxseuttpurnxbluvcwx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdteHNldXR0cHVybnhibHV2Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDUwODAsImV4cCI6MjA5MDIyMTA4MH0.xJ23Mr1hJ5F2vPnJOPDiJxtFkBqXtAko1dD02NNlris
ENV NEXT_PUBLIC_APP_URL=https://www.syllabi.online
ENV NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID=price_1TQCdK3kBvceiBKL55hBCThQ
ENV NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID=price_1TQCdO3kBvceiBKLe9lkVg2W
ENV NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID=price_1TQCdR3kBvceiBKLbPuTyGbN
ENV NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID=price_1TQCdU3kBvceiBKLmJomudXc
ENV NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID=price_1TQCdX3kBvceiBKLsTvu6VNt
ENV NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID=price_1TQCdb3kBvceiBKLPXT2LmDxC
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role
ENV SUPABASE_URL=https://gmxseuttpurnxbluvcwx.supabase.co
ENV SUPABASE_ANON_KEY=placeholder_anon_key
ENV ANTHROPIC_API_KEY=placeholder
ENV STRIPE_SECRET_KEY=sk_test_placeholder
ENV INTERNAL_API_SECRET=placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# ─── runner stage ──────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Chromium runtime deps + fonts covering our 16 locales (incl. CJK, Arabic, Cyrillic)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-noto-extra \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    wget \
  && rm -rf /var/lib/apt/lists/*

# Install Playwright's bundled Chromium into /ms-playwright (deterministic path)
RUN corepack enable pnpm && pnpm dlx playwright@1.59.1 install chromium --with-deps

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# Ensure the nextjs user can read the Chromium install
RUN chown -R nextjs:nodejs /ms-playwright

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
