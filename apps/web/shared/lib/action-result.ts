/**
 * Shared vocabulary for server action failure codes, so every slice's
 * `ActionResult` type and its consuming components reference the same
 * source of truth instead of retyping string literals.
 */
export const ACTION_ERROR = {
  invalid: "invalid",
  inUse: "inUse",
  duplicate: "duplicate",
  server: "server",
} as const

export type ActionErrorCode = (typeof ACTION_ERROR)[keyof typeof ACTION_ERROR]
