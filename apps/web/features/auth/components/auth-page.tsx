import { GalleryVerticalEndIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

import { getEnabledAuthProviders } from "../lib/auth-providers"
import { requireGuest } from "../server/session"
import { AuthForm } from "./auth-form"

async function AuthPage({
  error,
  mode,
}: {
  error?: string
  mode: "sign-in" | "sign-up"
}) {
  await requireGuest()
  const t = await getTranslations("auth")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          {t("brand")}
        </Link>
        <AuthForm error={error} mode={mode} providers={getEnabledAuthProviders()} />
      </div>
    </div>
  )
}

export { AuthPage }
