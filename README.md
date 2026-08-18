# Licorice

Idiomatic `Next.js 16` monorepo template with `React 19`, `shadcn/ui`, `Better Auth`, `Kysely`, `next-intl`, `tsgo`, and vertical slice architecture.

## Stack

- `Next.js 16`
- `React 19`
- `Better Auth` for email/password and optional OAuth
- `Kysely` with SQLite by default
- `next-intl` for i18n (locale routing + per-slice messages)
- `@typescript/native-preview` via `tsgo`
- `shadcn/ui` in `packages/ui`
- `bun` workspaces + `turbo`

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
- `features/landing/*`: separate marketing/landing surface with its own composition
- `features/dashboard/data/*`: slice-local mock data
- `features/<slice>/messages/*.json`: slice-local translations (`en`, `pt`)

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

The template ships with:

- email/password enabled
- optional social providers when matching env vars exist
- Kysely-backed SQLite database at `apps/web/better-auth.db`
- protected `/dashboard`
- login and sign-up pages wired to Better Auth

## Adding shadcn components

Run from the repo root:

```bash
bunx shadcn@latest add button -c apps/web
```

Generated UI primitives land in `packages/ui/src/components`.

## Using UI primitives

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Validation

```bash
bun run typecheck
bun run lint
```
