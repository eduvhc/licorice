/**
 * Pure provider vocabulary — safe to import from Client Components. Anything
 * that needs environment variables (which providers are actually configured)
 * lives in `auth-providers.ts`, a server-only module.
 */

export type SocialProvider = "apple" | "discord" | "github" | "google"

export type EnabledAuthProviders = Partial<Record<SocialProvider, boolean>>

/**
 * Providers we render sign-in / connect buttons for, in display order. A
 * provider still only appears once its env pair is set (getEnabledAuthProviders).
 */
export const VISIBLE_SOCIAL_PROVIDERS = ["github", "google"] as const

export type VisibleSocialProvider = (typeof VISIBLE_SOCIAL_PROVIDERS)[number]
