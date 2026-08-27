import { env } from "@/lib/env"

import type { EnabledAuthProviders } from "./social-providers"

export function getEnabledAuthProviders(): EnabledAuthProviders {
  return {
    apple: Boolean(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET),
    discord: Boolean(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET),
    github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  }
}
