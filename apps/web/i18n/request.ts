import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import accountEn from "@/features/account/messages/en.json"
import accountPt from "@/features/account/messages/pt.json"
import authEn from "@/features/auth/messages/en.json"
import authPt from "@/features/auth/messages/pt.json"
import dashboardEn from "@/features/dashboard/messages/en.json"
import dashboardPt from "@/features/dashboard/messages/pt.json"
import landingEn from "@/features/landing/messages/en.json"
import landingPt from "@/features/landing/messages/pt.json"
import legalEn from "@/features/legal/messages/en.json"
import legalPt from "@/features/legal/messages/pt.json"
import marketingEn from "@/features/marketing/messages/en.json"
import marketingPt from "@/features/marketing/messages/pt.json"
import sharedEn from "@/shared/messages/en.json"
import sharedPt from "@/shared/messages/pt.json"

import { routing } from "./routing"

const messages = {
  en: {
    account: accountEn,
    auth: authEn,
    dashboard: dashboardEn,
    landing: landingEn,
    legal: legalEn,
    marketing: marketingEn,
    shared: sharedEn,
  },
  pt: {
    account: accountPt,
    auth: authPt,
    dashboard: dashboardPt,
    landing: landingPt,
    legal: legalPt,
    marketing: marketingPt,
    shared: sharedPt,
  },
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: messages[locale],
  }
})
