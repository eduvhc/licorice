import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { ResetPasswordPage } from "@/features/auth/components/reset-password-page"
import { routing } from "@/i18n/routing"

type ResetPasswordRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    token?: string
    error?: string
  }>
}

export default async function Page({
  params,
  searchParams,
}: ResetPasswordRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { token, error } = await searchParams

  return <ResetPasswordPage error={error} token={token ?? ""} />
}
