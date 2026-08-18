import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { AuthPage } from "@/features/auth/components/auth-page"
import { routing } from "@/i18n/routing"

type SignUpRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    error?: string
  }>
}

export default async function SignUpPage({ params, searchParams }: SignUpRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { error } = await searchParams

  return <AuthPage error={error} mode="sign-up" />
}
