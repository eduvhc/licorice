import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page"
import { routing } from "@/i18n/routing"

type ForgotPasswordRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    sent?: string
  }>
}

export default async function Page({
  params,
  searchParams,
}: ForgotPasswordRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { sent } = await searchParams

  return <ForgotPasswordPage sent={sent === "1"} />
}
