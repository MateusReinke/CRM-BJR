# syntax=docker/dockerfile:1
#
# Single-stage image: keeps devDependencies (drizzle-kit, tsx, vite, esbuild)
# available at runtime so `npm run db:push` / `npm run db:seed` can be run
# directly against production via the platform's "execute a command in this
# container" feature (e.g. Coolify's terminal) - there's no separate
# migrations workflow in this project yet, only drizzle-kit push.
FROM node:22-slim
WORKDIR /app

# Force a non-production NODE_ENV for install/build, overriding whatever the
# platform injects as a build-time env var (Coolify passes every configured
# env var - including NODE_ENV=production - into the build stage by default).
# With NODE_ENV=production, `npm ci` skips devDependencies, so vite/esbuild
# go missing and `npm run build` fails with "vite: not found".
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Coolify (and some other platforms) exec curl inside the running container
# to poll the health endpoint during rolling deploys - node:22-slim doesn't
# ship it by default, which makes every deploy look "unhealthy" regardless
# of whether the app is actually fine.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --system --create-home appuser && chown -R appuser:appuser /app
USER appuser

# Only takes effect from here on (for the actual running container) - this is
# what makes the server pick serveStatic() over Vite's dev middleware.
ENV NODE_ENV=production

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

CMD ["node", "dist/index.js"]
