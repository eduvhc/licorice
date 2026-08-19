import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { SettingsPage } from "@/features/settings/components/settings-page"
import { routing } from "@/i18n/routing"

type SettingsRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

export default async function Page({
  params,
  searchParams,
}: SettingsRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { tab } = await searchParams

  const resolvedTab =
    tab === "tags" ? "tags" : tab === "bottles" ? "bottles" : "units"

  return <SettingsPage tab={resolvedTab} />
}
