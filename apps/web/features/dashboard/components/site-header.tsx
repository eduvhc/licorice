import { getTranslations } from "next-intl/server"

import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { LocaleSwitcher } from "@/shared/components/locale-switcher"

export async function SiteHeader() {
  const t = await getTranslations("dashboard")

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{t("header")}</h1>
        <div className="ml-auto">
          <LocaleSwitcher className="w-[88px] rounded-2xl" />
        </div>
      </div>
    </header>
  )
}
