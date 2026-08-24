#!/bin/sh
#
# Container start: bring the two SQLite databases up to date, then serve.
#
# Migrations run here rather than as a separate pre-deploy step because both
# databases are files on one mounted volume served by one container — there is
# no second replica that could race, and no window where a new image is live
# against an old schema. `set -e` means a failed migration stops the container
# instead of serving against a schema that was never applied.
#
set -e

echo "==> migrating"
cd /app/migrator
# The same program a developer runs locally via `pnpm db:migrate`, against the
# same migration files. Node runs the TypeScript directly.
node src/migrate.ts

echo "==> starting Next.js"
cd /app
exec node apps/web/server.js
