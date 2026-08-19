import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import Database from "better-sqlite3"
import { SqliteDialect } from "kysely"

import { sendEmail } from "@/features/email/server/mailer"
import {
  resetPasswordEmail,
  verificationEmail,
} from "@/features/email/server/templates"
import { databasePath } from "@/lib/db"
import { env } from "@/lib/env"

import { getEnabledAuthProviders } from "@/features/auth/lib/auth-providers"

const sqlite = new Database(databasePath)

const enabledProviders = getEnabledAuthProviders()

const socialProviders = {
  ...(enabledProviders.github
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID!,
          clientSecret: env.GITHUB_CLIENT_SECRET!,
        },
      }
    : {}),
  ...(enabledProviders.google
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {}),
  ...(enabledProviders.discord
    ? {
        discord: {
          clientId: env.DISCORD_CLIENT_ID!,
          clientSecret: env.DISCORD_CLIENT_SECRET!,
        },
      }
    : {}),
  ...(enabledProviders.apple
    ? {
        apple: {
          clientId: env.APPLE_CLIENT_ID!,
          clientSecret: env.APPLE_CLIENT_SECRET!,
        },
      }
    : {}),
}

export const auth = betterAuth({
  database: new SqliteDialect({
    database: sqlite,
  }),
  advanced: {
    database: {
      joins: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...(await resetPasswordEmail(url)) })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...(await verificationEmail(url)) })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    storage: "memory",
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  plugins: [nextCookies()],
})
