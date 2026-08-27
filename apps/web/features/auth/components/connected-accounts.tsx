import { getTranslations } from "next-intl/server"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { getSocialIcon } from "./provider-icons"
import {
  VISIBLE_SOCIAL_PROVIDERS,
  type EnabledAuthProviders,
} from "../lib/social-providers"
import { linkSocialAction, unlinkAccountAction } from "../server/actions"
import type { LinkedAccount } from "../server/queries"

export async function ConnectedAccounts({
  accounts,
  providers,
}: {
  accounts: LinkedAccount[]
  providers: EnabledAuthProviders
}) {
  const t = await getTranslations("auth.connectedAccounts")

  const hasPassword = accounts.some(
    (account) => account.providerId === "credential"
  )
  // Better Auth refuses to unlink a user's last credential; mirror that in the
  // UI so the button isn't offered when it would only fail.
  const canUnlink = accounts.length > 1

  const rows = VISIBLE_SOCIAL_PROVIDERS.filter(
    (provider) => providers[provider]
  ).map((provider) => ({
    provider,
    linked: accounts.find((account) => account.providerId === provider) ?? null,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasPassword ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">{t("password")}</p>
              <p className="text-sm text-muted-foreground">
                {t("passwordHint")}
              </p>
            </div>
          </div>
        ) : null}

        {rows.map(({ provider, linked }) => (
          <div
            key={provider}
            className="flex items-center justify-between gap-4 rounded-xl border p-4"
          >
            <div className="flex items-center gap-3">
              {getSocialIcon(provider)}
              <div className="space-y-0.5">
                <p className="font-medium">{t(`providers.${provider}`)}</p>
                <p className="text-sm text-muted-foreground">
                  {linked ? t("connected") : t("notConnected")}
                </p>
              </div>
            </div>

            {linked ? (
              canUnlink ? (
                <form action={unlinkAccountAction.bind(null, linked.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    {t("disconnect")}
                  </Button>
                </form>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  {t("disconnect")}
                </Button>
              )
            ) : (
              <form action={linkSocialAction.bind(null, provider)}>
                <Button type="submit" variant="outline" size="sm">
                  {t("connect")}
                </Button>
              </form>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
