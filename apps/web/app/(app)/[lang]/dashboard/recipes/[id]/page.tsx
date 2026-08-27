import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"

import { RecipeDetail } from "@/features/recipes/components/recipe-detail"
import { getRecipe } from "@/features/recipes/server/queries"
import { getRecipeRetailerBaskets } from "@/features/pricing/server/queries"
import { listBottles } from "@/features/settings/server/queries"
import { routing } from "@/i18n/routing"

type RecipeDetailRouteProps = {
  params: Promise<{
    lang: string
    id: string
  }>
}

export default async function Page({ params }: RecipeDetailRouteProps) {
  const { lang, id } = await params
  if (!hasLocale(routing.locales, lang)) notFound()

  const recipeId = Number(id)
  if (!Number.isInteger(recipeId) || recipeId <= 0) notFound()

  const [recipe, bottles, baskets] = await Promise.all([
    getRecipe(recipeId),
    listBottles(),
    getRecipeRetailerBaskets(recipeId),
  ])
  if (!recipe) notFound()

  return <RecipeDetail recipe={recipe} bottles={bottles} baskets={baskets} />
}
