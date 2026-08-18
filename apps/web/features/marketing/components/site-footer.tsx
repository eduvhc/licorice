import { getTranslations } from "next-intl/server"

import { getOptionalSession } from "@/features/auth/server/session"
import { Link } from "@/i18n/navigation"

export async function SiteFooter() {
  const t = await getTranslations("marketing")
  const session = await getOptionalSession()

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t("brand")}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("footer.description")}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link
            className="transition hover:text-foreground"
            href={session ? "/account" : "/login"}
          >
            {session ? t("footer.links.account") : t("footer.links.login")}
          </Link>
          <Link className="transition hover:text-foreground" href="/sign-up">
            {t("footer.links.create")}
          </Link>
          <Link className="transition hover:text-foreground" href="/dashboard">
            {t("footer.links.app")}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
