import { Geist_Mono, Source_Sans_3 } from "next/font/google"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"

import "@workspace/ui/globals.css"
import { AppProviders } from "@/shared/providers/app-providers"
import { cn } from "@workspace/ui/lib/utils"

const sourceSans3 = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Licorice",
  description: "Idiomatic Next.js monorepo template with vertical slice architecture.",
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
      className={cn("antialiased", fontMono.variable, "font-sans", sourceSans3.variable)}
    >
      <body>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
