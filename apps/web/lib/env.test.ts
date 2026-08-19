import { describe, expect, it } from "vitest"

import { envSchema } from "./env"

const validEnv = {
  BETTER_AUTH_SECRET: "secret",
  BETTER_AUTH_URL: "http://localhost:3000",
  DATABASE_URL: "./better-auth.db",
}

describe("envSchema", () => {
  it("accepts a minimal valid environment", () => {
    const result = envSchema.safeParse(validEnv)
    expect(result.success).toBe(true)
  })

  it("rejects a missing required variable", () => {
    const rest = { ...validEnv, BETTER_AUTH_SECRET: undefined }
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it("defaults EMAIL_FROM when not provided", () => {
    const result = envSchema.safeParse(validEnv)
    expect(result.success && result.data.EMAIL_FROM).toBe(
      "onboarding@example.com"
    )
  })
})
