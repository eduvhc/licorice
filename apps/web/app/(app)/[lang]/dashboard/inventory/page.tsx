import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { InventoryPage } from "@/features/inventory/components/inventory-page"
import { routing } from "@/i18n/routing"

type InventoryRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    tag?: string
  }>
}

export default async function Page({ params, searchParams }: InventoryRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { tag } = await searchParams
  const tagId = tag ? Number(tag) : NaN
  const filterTagId = Number.isInteger(tagId) && tagId > 0 ? tagId : "all"

  return <InventoryPage filterTagId={filterTagId} />
}
