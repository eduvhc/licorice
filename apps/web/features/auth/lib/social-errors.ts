/**
 * Better Auth reports OAuth callback failures by redirecting to
 * `errorCallbackURL?error=<code>` with a URL-safe slug. We translate the codes
 * we can act on; anything else is already a human message (email/password
 * flows put one there) and is shown unchanged.
 */
const KNOWN_SOCIAL_ERROR_CODES = [
  "account_not_linked",
  "email_not_found",
  "email_not_verified",
  "email_does_not_match",
  "unable_to_link_account",
  "account_already_linked_to_different_user",
] as const

type SocialErrorCode = (typeof KNOWN_SOCIAL_ERROR_CODES)[number]

function isSocialErrorCode(value: string): value is SocialErrorCode {
  return (KNOWN_SOCIAL_ERROR_CODES as readonly string[]).includes(value)
}

/**
 * Turn the `error` query param into a display string. Pass the `"auth"`
 * translator; a value that isn't a known code is returned unchanged.
 */
export function authErrorMessage(
  raw: string | undefined,
  t: (key: `social.errors.${SocialErrorCode}`) => string
): string | undefined {
  if (!raw) return undefined
  return isSocialErrorCode(raw) ? t(`social.errors.${raw}`) : raw
}
