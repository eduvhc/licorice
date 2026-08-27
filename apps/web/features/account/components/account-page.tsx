import { getFormatter, getTranslations } from "next-intl/server"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { signOutAction } from "@/features/auth/server/actions"
import { ConnectedAccounts } from "@/features/auth/components/connected-accounts"
import { authErrorMessage } from "@/features/auth/lib/social-errors"
import type { EnabledAuthProviders } from "@/features/auth/lib/social-providers"
import type { LinkedAccount } from "@/features/auth/server/queries"
import { Link } from "@/i18n/navigation"
import { LocaleSwitcher } from "@/shared/components/locale-switcher"

type AccountPageProps = {
  error?: string
  accounts: LinkedAccount[]
  providers: EnabledAuthProviders
  session: {
    session: {
      createdAt: Date
      expiresAt: Date
    }
    user: {
      email: string
      emailVerified: boolean
      name: string
    }
  }
}

async function AccountPage({
  error,
  accounts,
  providers,
  session,
}: AccountPageProps) {
  const t = await getTranslations("account")
  const authT = await getTranslations("auth")
  const format = await getFormatter()

  const errorMessage = authErrorMessage(error, authT)
  const formatDate = (date: Date) =>
    format.dateTime(date, { dateStyle: "medium", timeStyle: "short" })

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-6 py-12 lg:px-10">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            {t("eyebrow")}
          </p>
          <LocaleSwitcher className="w-[88px] rounded-2xl" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{session.user.name}</CardTitle>
          <CardDescription>{session.user.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">
              {t("emailVerified")}
            </p>
            <p className="mt-1 font-medium">
              {session.user.emailVerified ? t("verified") : t("pending")}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">
              {t("sessionExpires")}
            </p>
            <p className="mt-1 font-medium">
              {formatDate(session.session.expiresAt)}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{t("signedInAt")}</p>
            <p className="mt-1 font-medium">
              {formatDate(session.session.createdAt)}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{t("primaryRoute")}</p>
            <p className="mt-1 font-medium">/dashboard</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{errorMessage ?? ""}</p>
          <div className="flex gap-3">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/dashboard"
            >
              {t("backToDashboard")}
            </Link>
            <form action={signOutAction}>
              <Button type="submit">{t("signOut")}</Button>
            </form>
          </div>
        </CardFooter>
      </Card>

      <ConnectedAccounts accounts={accounts} providers={providers} />
    </main>
  )
}

export { AccountPage }
