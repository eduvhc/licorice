import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { InventoryPage } from "@/features/inventory/components/inventory-page"
import { routing } from "@/i18n/routing"

type InventoryRouteProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: InventoryRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  return <InventoryPage />
}
