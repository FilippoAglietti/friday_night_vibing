# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined by Next.js at build time (even in server code).
# These are client-safe by design — same values ship in the browser bundle.
ENV NEXT_PUBLIC_SUPABASE_URL=https://gmxseuttpurnxbluvcwx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdteHNldXR0cHVybnhibHV2Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDUwODAsImV4cCI6MjA5MDIyMTA4MH0.xJ23Mr1hJ5F2vPnJOPDiJxtFkBqXtAko1dD02NNlris
ENV NEXT_PUBLIC_APP_URL=https://www.syllabi.online
# Server-only secrets — placeholders at build; real values injected at runtime by Cloud Run.
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role
ENV SUPABASE_URL=https://gmxseuttpurnxbluvcwx.supabase.co
ENV SUPABASE_ANON_KEY=placeholder_anon_key
ENV ANTHROPIC_API_KEY=placeholder
ENV STRIPE_SECRET_KEY=sk_test_placeholder
ENV INTERNAL_API_SECRET=placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
