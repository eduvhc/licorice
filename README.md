# Licorice

Idiomatic `Next.js 16` monorepo template with `React 19`, `shadcn/ui`, `Better Auth`, `Kysely`, `next-intl`, `tsgo`, and vertical slice architecture.

## Stack

- `Next.js 16`
- `React 19`
- `Better Auth` for email/password and optional OAuth, with password reset, email verification, and rate limiting wired in
- `Kysely` with SQLite by default
- `next-intl` for i18n (locale routing + per-slice messages)
- `zod`-validated environment variables (`apps/web/lib/env.ts`)
- Provider-agnostic transactional email (`apps/web/features/email/*`), `react-email` templates, local preview server, local Mailpit catcher via `docker-compose.yml`
- Baseline security headers + CSP (`next.config.ts`)
- `pino` structured logging, correlated with `@sentry/nextjs` traces (both optional, zero-config in dev)
- `vitest` for unit tests, GitHub Actions CI (`.github/workflows/ci.yml`), `lefthook` pre-commit lint/format
- `@typescript/native-preview` via `tsgo`
- `shadcn/ui` in `packages/ui`
- `pnpm` workspaces + `turbo`, on Node 26

## Getting started

```bash
pnpm install
pnpm dlx lefthook install       # once, wires up pre-commit lint/format
cp apps/web/.env.example apps/web/.env
(cd apps/web && pnpm run db:migrate)
pnpm run dev
```

`BETTER_AUTH_SECRET` needs a real value (`openssl rand -hex 32`); everything else in `.env.example` is optional and documented inline.

## App conventions

- `apps/web/app/*`: route entrypoints only
- `apps/web/features/*`: slice-local UI, behavior, route guards, and data flow
- `apps/web/shared/*`: cross-cutting providers and app-specific hooks
- `apps/web/lib/*`: app infrastructure such as auth, db, and server helpers
- `packages/ui/*`: reusable design-system primitives shared across apps

Example structure:

```text
apps/web/
  app/
    (marketing)/
      [lang]/page.tsx
    (app)/
      [lang]/dashboard/page.tsx
  features/
    auth/
    landing/
    dashboard/
  i18n/
    routing.ts
    request.ts
    navigation.ts
  lib/
  shared/
    hooks/
    providers/
packages/ui/
```

## Auth

- API handler: `apps/web/app/api/auth/[...all]/route.ts`
- Server auth: `apps/web/lib/auth.ts`
- Client auth: `apps/web/lib/auth-client.ts`
- Auth slice: `apps/web/features/auth/*`

The template ships with:

- email/password enabled
- password reset (`/forgot-password`, `/reset-password`) and email verification on sign-up, both sending mail through the `email` slice (see below)
- optional social providers (GitHub, Google, Discord, Apple) — each enables automatically once its `*_CLIENT_ID`/`*_CLIENT_SECRET` pair is set
- Kysely-backed SQLite database at `apps/web/better-auth.db` (schema owned by Better Auth itself, not the app's `db/migrations`)
- protected `/dashboard`
- login, sign-up, forgot-password, and reset-password pages wired to Better Auth
- rate limiting enabled (in-memory, 60 requests/60s by default; Better Auth applies stricter built-in limits to `/sign-in`, `/sign-up`, and password-reset/verification paths on top of that) — swap `storage: "memory"` for `"database"` or `"secondary-storage"` if you scale past one process

Suggested slice layout:

```text
features/<slice>/
  components/
  lib/
  server/
  messages/
  data/
```

In this template:

- `features/auth/components/*`: auth screens and forms
- `features/auth/lib/*`: slice-local types and provider config
- `features/auth/server/*`: server actions and route/session guards
- `features/email/*`: provider-agnostic transactional email (see Email below)
- `features/inventory/*`: backoffice items and unit prices
- `features/recipes/*`: recipes with ingredients and computed cost
- `features/settings/*`: manage units and tags
- `features/<slice>/messages/*.json`: slice-local translations (`en`, `pt`)

## Alambique

The app product: manage liqueur recipes and inventory.

- Items: name, unit, unit price in EUR (stored as cents), and a tag (Base drink, Drink, Fruit, Accessory…)
- Recipes: name, description, and ingredient lines (item + quantity); total cost is computed from item prices
- Settings: manage units and tags (with colors) — protected against deletion while in use
- SQLite database at `apps/web/app.db` (schema via `db/migrations`, see below)
- Backoffice routes: `/dashboard` (overview), `/dashboard/recipes`, `/dashboard/inventory`, `/dashboard/settings`
- Filters and tabs are URL-driven (`?tag=`, `?tab=`) and rendered server-side

## i18n

`next-intl` with a locale segment (`en`, `pt`):

- `apps/web/proxy.ts`: locale negotiation and redirects (`/` -> `/en` or `/pt` via `Accept-Language`)
- `apps/web/i18n/routing.ts`: locales and default locale
- `apps/web/i18n/request.ts`: merges per-slice `messages/*.json` into the request config
- `apps/web/i18n/navigation.ts`: locale-aware `Link`, `redirect`, `useRouter`, `usePathname`
- `apps/web/global.d.ts`: typed messages via `AppConfig`
- server components use `getTranslations`/`getFormatter`; client components use `useTranslations`/`useFormatter` (provider lives in the root layout)
- arrays and rich structures are read with `t.raw("key")`
- marketing and app routes are partitioned with route groups: `(marketing)` and `(app)`

Adding a locale: add it to `i18n/routing.ts` and create the matching `messages/*.json` per slice.

## Environment variables

Validated once at import time via `apps/web/lib/env.ts` (`zod`) — the app fails fast with a readable error if a required var is missing, instead of failing later at the call site. See `apps/web/.env.example` for the full list; copy it to `.env` to get started.

- required: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`
- optional, each pair enables the OAuth provider: `GITHUB_CLIENT_ID`/`SECRET`, `GOOGLE_CLIENT_ID`/`SECRET`, `DISCORD_CLIENT_ID`/`SECRET`, `APPLE_CLIENT_ID`/`SECRET`
- optional, enables SMTP sending: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, plus `EMAIL_FROM`
- optional, enables Sentry: `SENTRY_DSN` (server/edge), `NEXT_PUBLIC_SENTRY_DSN` (browser), `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` (build-time source map upload only)
- optional: `LOG_LEVEL` (defaults to `info`)

## Email

Provider-agnostic transactional email, so a new idea can send mail on day one and swap providers later without touching call sites.

- `apps/web/features/email/lib/types.ts`: the `Mailer` interface every provider implements
- `apps/web/features/email/lib/providers/*`: `smtp` (via `nodemailer`, used when `SMTP_HOST` is set) and `console` (default — logs the email instead of sending it, so the template works with zero external setup)
- `apps/web/features/email/server/mailer.ts`: `sendEmail()`, the one function the rest of the app calls; picks the provider based on env
- `apps/web/features/email/templates/*.tsx`: `react-email` components (shared layout in `templates/components/email-layout.tsx`)
- `apps/web/features/email/server/templates.ts`: renders the React templates to HTML for `sendEmail()`

Preview templates locally (hot reload, desktop/mobile toggle, no email sent):

```bash
pnpm run email:dev   # from apps/web — http://localhost:3001
```

Adding a provider (e.g. Resend later): implement `Mailer` in a new `lib/providers/*.ts` file and add one branch to `mailer.ts` — nothing else changes.

Testing the SMTP path locally without a real inbox — `docker-compose.yml` ships a [Mailpit](https://github.com/axllent/mailpit) service:

```bash
pnpm run mail:up     # starts Mailpit — SMTP at :1025, web UI at http://localhost:8025
```

Point `SMTP_HOST=localhost` / `SMTP_PORT=1025` at it in `.env` to route real SMTP sends there instead of the console fallback.

## Security

- `apps/web/next.config.ts`: baseline security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) applied to every route via `headers()`; the CSP is relaxed (`unsafe-eval`) only in development for HMR/React DevTools
- `apps/web/lib/auth.ts`: Better Auth `rateLimit` enabled — see the Auth section above
- these are a starting baseline, not a hardened production config — tighten the CSP (e.g. nonces instead of `unsafe-inline`) and add `Strict-Transport-Security` once you're serving over HTTPS

## Logging & observability

- `apps/web/lib/logger.ts`: `pino` logger, pretty-printed in development, JSON in production; automatically tags each line with `trace_id`/`span_id` from the active OpenTelemetry span when Sentry is enabled, so logs and traces correlate
- `apps/web/instrumentation.ts` / `instrumentation-client.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`: Sentry wiring for server, edge, and browser — all no-ops until `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` is set, so nothing breaks or requires an account by default
- `next.config.ts` only wraps the build with `withSentryConfig` (source map upload) when `SENTRY_DSN` is present

## Testing & CI

- `vitest` (`apps/web/vitest.config.ts`), run with `pnpm run test`; seed tests at `lib/env.test.ts` and `features/auth/lib/auth-providers.test.ts` as copy-pasteable examples for new slices
- `.github/workflows/ci.yml`: lint, typecheck, test, and build on every push/PR via `turbo`, using dummy auth env vars (no secrets required)
- `lefthook.yml`: pre-commit hook runs `pnpm run format` and `pnpm run lint` (via `turbo`, same as CI); run `pnpm dlx lefthook install` once after cloning (see Getting started)

## Database & migrations

Kysely migrations via the official `kysely-ctl` CLI (dev dependency, configured in `apps/web`):

- `apps/web/kysely.config.ts`: dialect + `db/migrations` folder
- `apps/web/db/migrations/*.ts`: migration files with `up`/`down` (frozen in time, use `Kysely<any>`)
- applied migrations are tracked in the `kysely_migration` table
- `apps/web/lib/app-db.ts`: app database instance (`app.db`) + table types

Workflow (from `apps/web`):

```bash
pnpm run db:migrate         # kysely migrate:latest
pnpm run db:migrate:make    # kysely migrate:make <name>
pnpm run db:migrate:list    # kysely migrate:list
```

To add a table: create a migration, add its types to `lib/app-db.ts`, then run `pnpm run db:migrate`.

## Adding shadcn components

Run from the repo root:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Generated UI primitives land in `packages/ui/src/components`.

## Using UI primitives

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Validation

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```
