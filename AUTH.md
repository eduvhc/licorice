# Authentication

Licorice uses [Better Auth](https://better-auth.com). Email + password is always
on. Each social provider turns itself on automatically once its client id and
secret are present in the environment (`getEnabledAuthProviders()` in
`apps/web/features/auth/lib/auth-providers.ts`).

## Google sign-in

### 1. Create the OAuth client

1. Google Cloud Console → pick or create a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**.
   - App name, support email, developer contact.
   - Scopes: the defaults (`openid`, `.../auth/userinfo.email`,
     `.../auth/userinfo.profile`) are all Licorice needs — don't add more.
   - While the app is in **Testing**, add each Google account you want to sign in
     with under **Test users**. Publish it later with no code change.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**.
   - Fill in the origins and redirect URIs from the next section.
   - Create, then copy the **Client ID** and **Client secret**.

### 2. Authorized JavaScript origins and redirect URIs

Better Auth exchanges the OAuth code server-side, so the **redirect URIs** are
what must be exact. Add the **JavaScript origins** too — Google's console expects
them and it keeps the door open for the client SDK later.

The redirect URI Better Auth sends to Google is always
`<BETTER_AUTH_URL>/api/auth/callback/google` — an exact string match on scheme,
host, port and path. What matters is the value of `BETTER_AUTH_URL` and the
hostname in the browser's address bar, **not** how DNS resolves it: an internal
DNS rewrite (AdGuard etc.) pointing `licorice.iedora.com` at a LAN box is
invisible to Google.

Google also **rejects raw private IPs** (`192.168.x.x`, `10.x`, …) as redirect
URIs — only `localhost` / `127.0.0.1` are exempt. So `BETTER_AUTH_URL` must be
`http://localhost:3000` or the real `https://` hostname; never a bare LAN IP.

**Authorized JavaScript origins**

| Environment | Value                         |
| ----------- | ----------------------------- |
| Local       | `http://localhost:3000`       |
| Production  | `https://licorice.iedora.com` |

**Authorized redirect URIs**

| Environment | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Local       | `http://localhost:3000/api/auth/callback/google`       |
| Production  | `https://licorice.iedora.com/api/auth/callback/google` |

Add the local row only if you develop against `http://localhost:3000`
(`BETTER_AUTH_URL=http://localhost:3000`). If instead you browse local dev at
`https://licorice.iedora.com` (internal DNS → LAN box, local TLS for that host,
`BETTER_AUTH_URL=https://licorice.iedora.com`), the production row already covers
it and nothing extra is needed.

One OAuth client holds every row at once. `http://localhost` is allowed without
HTTPS; every other host must be `https://`.

If `BETTER_AUTH_URL` ever changes, update it where it lives (`apps/web/.env`
locally, `config/deploy.yml` `env.clear` for prod) **and** add the matching
redirect URI here, or sign-in fails with `redirect_uri_mismatch`.

### 3. Wire the credentials in

**Local** — add to `apps/web/.env`:

```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
```

Restart `pnpm dev`. The "Continue with Google" button appears on `/login` and
`/sign-up`, and a "Connected accounts" card appears on `/account`.

**Production** — the values flow through four files (all already prepared):

1. Forgejo repo secrets `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   (reconciled by the homelab Ansible role — see `DEPLOY.md`).
2. `.forgejo/workflows/publish-image.yml` exposes them to the deploy job.
3. `.kamal/secrets` maps them through.
4. `config/deploy.yml` `env.secret` passes them into the container.

Deploy. Nothing else to do — the provider self-enables.

### 4. Account linking

`apps/web/lib/auth.ts` sets `account.accountLinking.trustedProviders: ["google"]`.
Because Google returns a verified email:

- Signing in with Google using the same address as an existing **verified**
  email/password account **links automatically** — one user, two ways in.
- If the existing email/password account is **unverified**, Better Auth refuses
  and redirects to `/login?error=account_not_linked` (shown as a friendly
  message). The user verifies their email, or signs in with the password and
  connects Google from `/account`.

Users manage links on the account page: **Connect** starts the OAuth flow and
attaches the provider; **Disconnect** removes it. The last remaining sign-in
method can't be disconnected.

## Related code

| Path                                                       | Role                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/web/lib/auth.ts`                                     | Better Auth server config (`baseURL`, providers, linking)           |
| `apps/web/lib/env.ts`                                      | Validates `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`               |
| `apps/web/features/auth/lib/auth-providers.ts`             | Which providers are enabled / visible                               |
| `apps/web/features/auth/server/actions.ts`                 | `signInWithSocialAction`, `linkSocialAction`, `unlinkAccountAction` |
| `apps/web/features/auth/server/queries.ts`                 | `listLinkedAccounts`                                                |
| `apps/web/features/auth/components/connected-accounts.tsx` | Account-page connect/disconnect UI                                  |
