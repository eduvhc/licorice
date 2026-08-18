import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { LegalPage } from "@/features/legal/components/legal-page"
import { routing } from "@/i18n/routing"

type TermsPageProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: TermsPageProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  return <LegalPage page="terms" />
}
