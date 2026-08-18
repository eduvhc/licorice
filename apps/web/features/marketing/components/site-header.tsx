import { BotIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { getOptionalSession } from "@/features/auth/server/session"
import { Link } from "@/i18n/navigation"
import { LocaleSwitcher } from "@/shared/components/locale-switcher"

import { ThemeToggle } from "./theme-toggle"

export async function SiteHeader() {
  const t = await getTranslations("marketing")
  const session = await getOptionalSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BotIcon className="size-4" />
          </div>
          <span>{t("brand")}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-6 text-sm md:flex">
          <a
            className="text-muted-foreground transition hover:text-foreground"
            href="#why"
          >
            {t("nav.why")}
          </a>
          <a
            className="text-muted-foreground transition hover:text-foreground"
            href="#systems"
          >
            {t("nav.builtIns")}
          </a>
          <a
            className="text-muted-foreground transition hover:text-foreground"
            href="#agents"
          >
            {t("nav.agents")}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher className="w-[76px]" />
          <ThemeToggle label={t("themeToggle")} />
          <Link
            className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}
            href={session ? "/account" : "/login"}
          >
            {session ? t("footer.links.account") : t("footer.links.login")}
          </Link>
          <Link
            className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
            href={session ? "/dashboard" : "/sign-up"}
          >
            {session ? t("footer.links.app") : t("footer.links.create")}
          </Link>
        </div>
      </div>
    </header>
  )
}
