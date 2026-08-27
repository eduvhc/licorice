import { notFound } from "next/navigation"

import { listItems } from "@/features/inventory/server/queries"
import { RecipeEditor } from "@/features/recipes/components/recipe-editor"
import { getRecipe } from "@/features/recipes/server/queries"

type EditRecipeRouteProps = {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: EditRecipeRouteProps) {
  const { id } = await params
  const recipeId = Number(id)
  if (!Number.isInteger(recipeId) || recipeId <= 0) notFound()

  const [recipe, items] = await Promise.all([getRecipe(recipeId), listItems()])
  if (!recipe) notFound()

  return <RecipeEditor items={items} recipe={recipe} />
}
