# syntax=docker/dockerfile:1
#
# Single-stage image: keeps devDependencies (drizzle-kit, tsx, vite, esbuild)
# available at runtime so `npm run db:push` / `npm run db:seed` can be run
# directly against production via the platform's "execute a command in this
# container" feature (e.g. Coolify's terminal) - there's no separate
# migrations workflow in this project yet, only drizzle-kit push.
FROM node:22-slim
WORKDIR /app

# Installed before NODE_ENV=production is set below, so devDependencies are
# still included.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN useradd --system --create-home appuser && chown -R appuser:appuser /app
USER appuser

# Only applies from here on - doesn't affect the npm ci/build steps above,
# but is what makes the server pick serveStatic() over Vite's dev middleware.
ENV NODE_ENV=production

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
