"use client"

import { useLocale, useTranslations } from "next-intl"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("shared")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        router.replace(pathname, { locale: value as "en" | "pt" })
      }}
    >
      <SelectTrigger className={className} aria-label={t("selectLanguage")} size="sm">
        <SelectValue placeholder={locale.toUpperCase()} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {routing.locales.map((item) => (
            <SelectItem key={item} value={item}>
              {item.toUpperCase()}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { LocaleSwitcher }
