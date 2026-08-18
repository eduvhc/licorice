import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { LegalPage } from "@/features/legal/components/legal-page"
import { routing } from "@/i18n/routing"

type PrivacyPageProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: PrivacyPageProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  return <LegalPage page="privacy" />
}
