export type SocialProvider = "apple" | "discord" | "github" | "google"

export type EnabledAuthProviders = Partial<Record<SocialProvider, boolean>>

export function getEnabledAuthProviders(): EnabledAuthProviders {
  return {
    apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    discord: Boolean(
      process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
    ),
    github: Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ),
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
  }
}
