import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { getOptionalSession } from "@/features/auth/server/session"
import { LandingPage } from "@/features/landing/components/landing-page"
import { routing } from "@/i18n/routing"

type MarketingPageProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: MarketingPageProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const session = await getOptionalSession()

  return <LandingPage session={session} />
}
