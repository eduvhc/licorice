import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { PricingPage } from "@/features/pricing/components/pricing-page"
import { routing } from "@/i18n/routing"

type PricingRouteProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: PricingRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  return <PricingPage />
}
