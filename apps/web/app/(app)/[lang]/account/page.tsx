import { AccountPage } from "@/features/account/components/account-page"
import { getEnabledAuthProviders } from "@/features/auth/lib/auth-providers"
import { listLinkedAccounts } from "@/features/auth/server/queries"
import { requireSession } from "@/features/auth/server/session"

type AccountRouteProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function Page({ searchParams }: AccountRouteProps) {
  const { error } = await searchParams
  const session = await requireSession()
  const accounts = await listLinkedAccounts()

  return (
    <AccountPage
      error={error}
      accounts={accounts}
      providers={getEnabledAuthProviders()}
      session={session}
    />
  )
}
