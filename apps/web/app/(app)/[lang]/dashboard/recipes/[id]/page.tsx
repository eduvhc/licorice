import { notFound } from "next/navigation"

import { RecipeBasket } from "@/features/pricing/components/recipe-basket"
import { getRecipeRetailerBaskets } from "@/features/pricing/server/queries"
import { RecipeDetail } from "@/features/recipes/components/recipe-detail"
import { getRecipe } from "@/features/recipes/server/queries"
import { listBottles } from "@/features/settings/server/queries"

type RecipeDetailRouteProps = {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: RecipeDetailRouteProps) {
  const { id } = await params
  const recipeId = Number(id)
  if (!Number.isInteger(recipeId) || recipeId <= 0) notFound()

  const [recipe, bottles, baskets] = await Promise.all([
    getRecipe(recipeId),
    listBottles(),
    getRecipeRetailerBaskets(recipeId),
  ])
  if (!recipe) notFound()

  return (
    <RecipeDetail
      recipe={recipe}
      bottles={bottles}
      pricingSlot={<RecipeBasket baskets={baskets} />}
    />
  )
}
