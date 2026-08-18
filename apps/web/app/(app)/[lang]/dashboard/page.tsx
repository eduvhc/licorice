import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { requireSession } from "@/features/auth/server/session"
import { DashboardPage } from "@/features/dashboard/components/dashboard-page"
import { routing } from "@/i18n/routing"

type DashboardRouteProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: DashboardRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const session = await requireSession()

  return <DashboardPage user={session.user} />
}
