import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { listItems } from "@/features/inventory/server/queries"
import { RecipeEditor } from "@/features/recipes/components/recipe-editor"
import { routing } from "@/i18n/routing"

type NewRecipeRouteProps = {
  params: Promise<{
    lang: string
  }>
}

export default async function Page({ params }: NewRecipeRouteProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  const items = await listItems()

  return <RecipeEditor items={items} />
}
