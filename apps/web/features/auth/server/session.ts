import { headers } from "next/headers"
import { cache } from "react"
import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"

import { auth } from "@/lib/auth"

export const getOptionalSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  })
})

export async function requireSession() {
  const session = await getOptionalSession()

  if (!session) {
    redirect({ href: "/login", locale: await getLocale() })
  }

  return session!
}

export async function requireGuest() {
  const session = await getOptionalSession()

  if (session) {
    redirect({ href: "/dashboard", locale: await getLocale() })
  }
}
