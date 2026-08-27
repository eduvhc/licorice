import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { routing } from "@/i18n/routing"

/**
 * Shared `[lang]` layout for every route group. It sits directly under the
 * dynamic segment so:
 *
 * - `setRequestLocale` pins the locale for Server Components below it (there is
 *   no middleware to derive it from the request), and
 * - `NextIntlClientProvider` re-renders with fresh messages on a client-side
 *   locale switch — mounted on the root layout it never would.
 *
 * Each `app/(group)/[lang]/layout.tsx` is a one-line re-export of this.
 */
export async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  setRequestLocale(lang)

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
