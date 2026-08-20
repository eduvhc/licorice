import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { RecipesPage } from "@/features/recipes/components/recipes-page"
import { routing } from "@/i18n/routing"

type RecipesRouteProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: RecipesRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  return <RecipesPage />
}
