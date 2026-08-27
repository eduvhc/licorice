import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"

import "@workspace/ui/globals.css"
import { AppProviders } from "@/shared/providers/app-providers"

export const metadata: Metadata = {
  title: "Alambique",
  description: "Gestão de receitas de licores e inventário.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="antialiased"
    >
      <body>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
