# Licorice deployment

## Purpose

Licorice is deployed by Forgejo Actions and Kamal 2. Forgejo Actions builds
the OCI image, publishes immutable `sha-<commit>` and `latest` tags to the
private Forgejo registry, then Kamal deploys the immutable tag to the Licorice
application VM.

## Runtime

| Item | Value |
|---|---|
| Application URL | https://licorice.iedora.com |
| OCI image | `iedora/licorice` via `git.iedora.com` |
| Deployment target | 192.168.50.64 |
| Runtime controller | Kamal 2.12.0 |
| Persistent data | Docker volume `licorice-data` mounted at `/app/data` |

Caddy owns TLS and forwards requests to Kamal Proxy. Licorice owns customer
authentication; Authelia does not front this application.

Kamal Proxy checks the locale-independent `GET /health` endpoint every three
seconds. The application excludes that operational route from locale
negotiation, so it always returns HTTP 200 without a redirect.

## Deployment

A push to `master` runs `.forgejo/workflows/publish-image.yml`. The workflow:

1. builds and pushes `sha-<commit>`;
2. installs Kamal 2.12.0;
3. runs `kamal deploy --skip-push --version sha-<commit>`.

The deployment configuration requires Kamal 2.12.0 or newer, waits up to 60
seconds for readiness, and retains three prior container/image versions for
rollback without unbounded disk growth.

`--skip-push` is intentional: Kamal deploys the image that the workflow already
published instead of rebuilding it. The Forgejo secrets `REGISTRY_TOKEN`,
`BETTER_AUTH_SECRET`, and `KAMAL_SSH_PRIVATE_KEY` are reconciled by the
homelab Ansible role.

## Data

Both SQLite databases are stored in `licorice-data`. The container entrypoint
runs Better Auth and application migrations before starting the Next.js server.
Back up the Docker volume before treating customer data as recoverable.

## Verify

After a push, inspect the Forgejo workflow. It must publish the immutable tag,
complete the Kamal deployment job, and receive HTTP 200 from `/health` at
https://licorice.iedora.com/health.
