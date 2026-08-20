import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { listItems } from "@/features/inventory/server/queries"
import { RecipeEditor } from "@/features/recipes/components/recipe-editor"
import { getRecipe } from "@/features/recipes/server/queries"
import { routing } from "@/i18n/routing"

type EditRecipeRouteProps = {
  params: Promise<{
    lang: string
    id: string
  }>
}

export default async function Page({ params }: EditRecipeRouteProps) {
  const { lang, id } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  const recipeId = Number(id)
  if (!Number.isInteger(recipeId) || recipeId <= 0) notFound()

  const [recipe, items] = await Promise.all([getRecipe(recipeId), listItems()])
  if (!recipe) notFound()

  return <RecipeEditor items={items} recipe={recipe} />
}
