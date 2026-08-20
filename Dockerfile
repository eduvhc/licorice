# syntax=docker/dockerfile:1

FROM oven/bun:1.3.13-slim AS base
WORKDIR /repo

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
# SENTRY_AUTH_TOKEN only matters if source-map upload is wired up later —
# next.config.ts already no-ops Sentry entirely when SENTRY_DSN is unset.
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Next's standalone output mirrors the monorepo layout it was built from —
# server.js lands at apps/web/server.js with a pruned node_modules alongside,
# so static assets and public/ have to be copied back into the matching
# apps/web subpath rather than the image root.
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
