# Deploying licorice

This app is deployed by **Coolify**, on a Proxmox homelab
([simplab](https://github.com/eduvhc/simplab)) — VM 211 "apps",
`192.168.50.211`. Coolify clones _this_ repository and builds it here, so the
build context, the Dockerfile and the deploy record all live in this repo.
simplab declares the machines; it does not describe the apps that run on them.

## Build pack: Dockerfile, not compose

Coolify's **Dockerfile** build pack, pointed at this repository. The root
`docker-compose.yml` here is the _local development_ stack (Mailpit as an SMTP
catcher) and is not what gets deployed.

Node 26 + pnpm. The app was on bun and does not build there: `bun install` hangs
forever inside the image after `error: Fail extracting tarball for "next"`, and
before that its Node shim segfaulted on a postinstall script because QEMU's
default CPU model masks AVX. The CPU is fixed on the host side
(`vm_cpu_type = "host"` in simplab); the hang is not. Node is what Next's
standalone server targets anyway.

## Coolify UI steps

Register the apps VM once, if it is not already a server:

```
Keys & Tokens → Private Keys → Add    (paste `tofu -chdir=tofu output -raw coolify_ssh_private_key` from simplab, name it "apps-vm")
Servers → Add a new server            (apps, 192.168.50.211, port 22, user root, key "apps-vm")
→ Validate server
```

Then the app:

```
Projects → Add resource → Public Repository
  Repository     https://github.com/eduvhc/licorice
  Branch         master
  Build pack     Dockerfile
  Base Directory /
  Dockerfile     /Dockerfile
  Port           3000
```

Environment variables — Coolify stores these in its own database. The full set
of keys, with what each one does, is `apps/web/.env.example`; the schema that
validates them at boot is `apps/web/lib/env.ts`. The deployment minimum:

| Key                  | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | 32-byte hex, `openssl rand -hex 32` — mark it as a secret in Coolify |
| `BETTER_AUTH_URL`    | the origin the browser uses, e.g. `http://192.168.50.211:3000`       |
| `DATABASE_URL`       | `/app/data/better-auth.db`                                           |
| `APP_DATABASE_URL`   | `/app/data/app.db`                                                   |
| `EMAIL_FROM`         | `onboarding@example.com` until real mail is wired                    |
| `LOG_LEVEL`          | `info`                                                               |

`BETTER_AUTH_URL` must match the origin the browser actually uses, or Better
Auth rejects the request as cross-origin.

Persistent storage — **required**, both databases are files:

```
Storages → Add → Volume
  Name         licorice-data
  Destination  /app/data
```

Without a domain, add a port mapping `3000:3000` under Network so the app
answers at `http://192.168.50.211:3000`. With a domain, set it in Coolify
instead and drop the mapping — Traefik routes to the container's port 3000 and
terminates TLS.

## Migrations

`docker-entrypoint.sh` runs the migrator on every container start, before the
server. It migrates **two** schemas:

1. Better Auth's own tables, via `getMigrations()` from `better-auth/db/migration`.
2. This app's tables, via Kysely's `Migrator` over `apps/web/db/migrations`.

Both are needed. Better Auth's schema is not part of the app's migration folder,
and the CLI that would create it is not in the runtime image — so on a fresh
volume, sign-up fails at runtime unless step 1 runs. Verified: a fresh database
comes out with `account`, `session`, `user`, `verification` plus the app's seven
tables.

The migrator is **bundled** with esbuild at build time rather than copied in as
source. pnpm stores each package under `node_modules/.pnpm` and links it into
place, so copying `better-auth` into the runtime image lands it without its own
dependencies — it fails with `Cannot find package '@better-auth/core'`. Bundling
resolves that at build time into one file. `better-sqlite3` stays external
because it is a native module Next already traces into the standalone output.

No pre-deployment hook to configure in Coolify: one container, one volume, no
replica that could race a schema change.

## Data, and what is not backed up

Both SQLite files live in the `licorice-data` volume, on the apps VM's disk.

**There is no backup of that volume.** simplab used to run a nightly whole-guest
`vzdump` and it was removed; a backup story there is an open decision. Until it
is made, treat this deployment's data as **not protected against anything** —
not a deleted volume, not a dead disk. If the data starts to matter, copy
`/app/data` off the machine on a schedule before relying on it.

`BETTER_AUTH_SECRET` is separate from the data: losing it does not encrypt
anything, but it invalidates every existing session and password-reset token.
Keep it in your password manager.

## Why not Kamal

This repo used to carry `config/deploy.yml`, `.kamal/`, and a deploy workflow
for [Kamal](https://kamal-deploy.org). They were removed when the app moved to
Coolify. Three reasons, in order of weight:

1. **They cannot coexist.** Kamal and Coolify each run their own proxy and each
   want ports 80/443. One host, one of them.
2. **The homelab node has no room for a second host.** 15 GB total: ~2 for
   Proxmox, 4 for the Coolify VM, 6 for the apps VM. A third VM does not fit.
3. **The config was already dead.** It pointed at `192.168.50.209` — a host from
   a previous homelab — and a domain that no longer resolves.

The honest cost of Coolify: a Kamal deploy is fully described by a committed
file, and a Coolify deploy is not — its state lives in Coolify's Postgres. This
page is what closes that gap, which is why it is committed here rather than
held in the UI.

Two loose ends left on GitHub, neither of them in this repo: the `KAMAL_SSH_KEY`
and `KAMAL_REGISTRY_PASSWORD` **repository secrets**, which can be deleted, and
the old `ghcr.io/eduvhc/licorice` package, which nothing pulls any more. Coolify
builds from source on the apps VM; there is no registry in this path.
