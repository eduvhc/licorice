# syntax=docker/dockerfile:1

# Node, not bun: `bun install` hangs indefinitely in this image after
# "error: Fail extracting tarball for next", and its node shim segfaulted
# running a postinstall script. Next's standalone server targets Node anyway.
FROM node:26.7.0-slim AS base
WORKDIR /repo
# Node no longer ships Corepack, so pnpm is installed explicitly and pinned to
# the same version as package.json's packageManager field.
RUN npm install -g pnpm@11.23.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# next build imports lib/env.ts, which parses the whole zod schema and throws on
# a missing required key — so the build needs values even though it never
# connects to anything. These are deliberately non-secret placeholders; the real
# values are supplied as runtime environment variables by Coolify, and nothing
# built here embeds them (no NEXT_PUBLIC_* among them).
ENV BETTER_AUTH_SECRET=build-time-placeholder-not-a-secret
ENV BETTER_AUTH_URL=http://localhost:3000
ENV DATABASE_URL=/tmp/build-placeholder.db
# SENTRY_AUTH_TOKEN only matters if source-map upload is wired up later —
# next.config.ts already no-ops Sentry entirely when SENTRY_DSN is unset.
RUN pnpm run build

# The migrator ships as its own self-contained artifact: @workspace/db plus only
# its production dependencies, laid out so `kysely migrate:latest` runs in the
# container exactly as it does on a developer's machine. `pnpm deploy` is the
# tool for this; --legacy is required because this workspace does not use
# injected dependencies.
RUN pnpm deploy --filter=@workspace/db --prod --legacy /migrator

# better-sqlite3 ships a prebuilt binary for every platform it supports — 27 MB,
# of which this image loads exactly one. lib/binding.js picks the file by
# platform-arch name, so dropping the rest is invisible to it.
RUN find /migrator/node_modules/better-sqlite3/prebuilds -type f -name '*.node' \
      ! -name 'linux-x64.node' -delete

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

# The migrator, built above. Separate from the app's own node_modules on
# purpose: it is a different program with different dependencies, run to
# completion before the server starts.
COPY --from=build /migrator ./migrator

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Both SQLite files live here, and this is where the persistent volume mounts.
# Created in the image so the container still starts (against throwaway data)
# when no volume is attached.
RUN mkdir -p /app/data

EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
ENTRYPOINT ["./docker-entrypoint.sh"]
