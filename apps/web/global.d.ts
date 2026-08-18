import type accountEn from "./features/account/messages/en.json"
import type authEn from "./features/auth/messages/en.json"
import type dashboardEn from "./features/dashboard/messages/en.json"
import type landingEn from "./features/landing/messages/en.json"
import type legalEn from "./features/legal/messages/en.json"
import type marketingEn from "./features/marketing/messages/en.json"
import type sharedEn from "./shared/messages/en.json"
import type { routing } from "./i18n/routing"

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: {
      account: typeof accountEn
      auth: typeof authEn
      dashboard: typeof dashboardEn
      landing: typeof landingEn
      legal: typeof legalEn
      marketing: typeof marketingEn
      shared: typeof sharedEn
    }
  }
}
