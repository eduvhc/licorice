"use client"

import { useTranslations } from "next-intl"

import { TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { usePathname, useRouter } from "@/i18n/navigation"

export function SettingsTabs() {
  const t = useTranslations("settings")
  const pathname = usePathname()
  const router = useRouter()

  return (
    <TabsList>
      <TabsTrigger
        value="units"
        onClick={() =>
          router.replace(
            { pathname, query: { tab: "units" } },
            { scroll: false }
          )
        }
      >
        {t("tabs.units")}
      </TabsTrigger>
      <TabsTrigger
        value="tags"
        onClick={() =>
          router.replace(
            { pathname, query: { tab: "tags" } },
            { scroll: false }
          )
        }
      >
        {t("tabs.tags")}
      </TabsTrigger>
      <TabsTrigger
        value="bottles"
        onClick={() =>
          router.replace(
            { pathname, query: { tab: "bottles" } },
            { scroll: false }
          )
        }
      >
        {t("tabs.bottles")}
      </TabsTrigger>
    </TabsList>
  )
}
