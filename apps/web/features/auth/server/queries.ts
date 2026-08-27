import { headers } from "next/headers"
import { cache } from "react"

import { auth } from "@/lib/auth"

export type LinkedAccount = {
  id: string
  /** "credential" for email/password, otherwise the social provider id. */
  providerId: string
  createdAt: Date
}

export const listLinkedAccounts = cache(async (): Promise<LinkedAccount[]> => {
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })

  return accounts.map((account) => ({
    id: account.id,
    providerId: account.providerId,
    createdAt: account.createdAt,
  }))
})
