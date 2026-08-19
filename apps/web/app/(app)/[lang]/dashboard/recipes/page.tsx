import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { RecipesPage } from "@/features/recipes/components/recipes-page"
import { DEFAULT_MARGIN_PERCENT } from "@/features/recipes/lib/pricing"
import { routing } from "@/i18n/routing"

type RecipesRouteProps = {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    open?: string
    margin?: string
    batchMl?: string
  }>
}

export default async function Page({
  params,
  searchParams,
}: RecipesRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const { open, margin, batchMl } = await searchParams

  const openId = open ? Number(open) : NaN
  const openRecipeId = Number.isInteger(openId) && openId > 0 ? openId : null

  const marginValue = margin ? Number(margin) : NaN
  const marginPercent =
    Number.isFinite(marginValue) && marginValue >= 0 && marginValue < 100
      ? marginValue
      : DEFAULT_MARGIN_PERCENT

  const batchMlValue = batchMl ? Number(batchMl) : NaN
  const batchMlParsed =
    Number.isFinite(batchMlValue) && batchMlValue > 0 ? batchMlValue : null

  return (
    <RecipesPage
      openRecipeId={openRecipeId}
      marginPercent={marginPercent}
      batchMl={batchMlParsed}
    />
  )
}
