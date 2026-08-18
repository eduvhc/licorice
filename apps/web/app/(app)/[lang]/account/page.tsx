import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { requireSession } from "@/features/auth/server/session"
import { AccountPage } from "@/features/account/components/account-page"
import { routing } from "@/i18n/routing"

type AccountRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    error?: string
  }>
}

export default async function Page({ params, searchParams }: AccountRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { error } = await searchParams
  const session = await requireSession()

  return <AccountPage error={error} session={session} />
}
