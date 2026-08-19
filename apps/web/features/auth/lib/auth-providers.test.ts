import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_CLIENT_ID: "id",
    GITHUB_CLIENT_SECRET: "secret",
  },
}))

const { getEnabledAuthProviders } = await import("./auth-providers")

describe("getEnabledAuthProviders", () => {
  it("enables a provider only when both id and secret are set", () => {
    expect(getEnabledAuthProviders()).toEqual({
      apple: false,
      discord: false,
      github: true,
      google: false,
    })
  })
})
