# syntax=docker/dockerfile:1

# ---- deps: install once, reused by the build stage ----
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# ---- builder: compile the Next.js app ----
FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time-only placeholders. Real secrets are injected at container start
# (docker run -e / compose env_file / your orchestrator's secret store) and
# are NEVER baked into the image. These exist only so the module-scope
# clients in src/lib (db, auth, stream-video, gemini) don't throw during
# `next build` — every route in this app is server-rendered on demand, so
# no real DB/API call happens at build time.
ARG DATABASE_URL=postgresql://user:password@localhost:5432/meet_ai
ARG BETTER_AUTH_SECRET=build-placeholder
ARG BETTER_AUTH_URL=http://localhost:3000
ARG GITHUB_CLIENT_ID=build-placeholder
ARG GITHUB_CLIENT_SECRET=build-placeholder
ARG GOOGLE_CLIENT_ID=build-placeholder
ARG GOOGLE_CLIENT_SECRET=build-placeholder
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_STREAM_VIDEO_API_KEY=build-placeholder
ARG STREAM_VIDEO_SECRET_KEY=build-placeholder
ARG GEMINI_API_KEY=build-placeholder
ARG AGENT_SERVICE_URL=http://localhost:8000

ENV DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_STREAM_VIDEO_API_KEY=$NEXT_PUBLIC_STREAM_VIDEO_API_KEY \
    STREAM_VIDEO_SECRET_KEY=$STREAM_VIDEO_SECRET_KEY \
    GEMINI_API_KEY=$GEMINI_API_KEY \
    AGENT_SERVICE_URL=$AGENT_SERVICE_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner: minimal production image ----
FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# .next/standalone already contains a pruned node_modules + server.js;
# static assets and public files aren't traced into it, so copy those too.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
