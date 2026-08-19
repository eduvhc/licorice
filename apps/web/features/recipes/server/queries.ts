import { cache } from "react"

import { appDb } from "@/lib/app-db"

export type RecipeIngredient = {
  itemId: number
  name: string
  unitName: string
  tagColor: string
  quantity: number
  priceCents: number
}

export type RecipeWithItems = {
  id: number
  name: string
  description: string
  items: RecipeIngredient[]
  totalCents: number
}

export const listRecipes = cache(async (): Promise<RecipeWithItems[]> => {
  const recipes = await appDb
    .selectFrom("recipes")
    .select(["id", "name", "description"])
    .orderBy("id", "desc")
    .execute()

  if (recipes.length === 0) {
    return []
  }

  const rows = await appDb
    .selectFrom("recipe_items as ri")
    .innerJoin("items as i", "i.id", "ri.item_id")
    .innerJoin("units as u", "u.id", "i.unit_id")
    .innerJoin("tags as tg", "tg.id", "i.tag_id")
    .select([
      "ri.recipe_id",
      "ri.quantity",
      "i.id as itemId",
      "i.name",
      "i.price_cents",
      "u.name as unitName",
      "tg.color as tagColor",
    ])
    .execute()

  return recipes.map((recipe) => {
    const items: RecipeIngredient[] = rows
      .filter((row) => row.recipe_id === recipe.id)
      .map((row) => ({
        itemId: row.itemId,
        name: row.name,
        unitName: row.unitName,
        tagColor: row.tagColor,
        quantity: row.quantity,
        priceCents: row.price_cents,
      }))

    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      items,
      totalCents: items.reduce(
        (sum, item) => sum + item.priceCents * item.quantity,
        0
      ),
    }
  })
})

export const getRecipe = cache(async (id: number): Promise<RecipeWithItems | null> => {
  const recipes = await listRecipes()
  return recipes.find((recipe) => recipe.id === id) ?? null
})

export type DashboardStats = {
  recipeCount: number
  itemCount: number
  inventoryValueCents: number
  avgRecipeCostCents: number
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const [recipes, items] = await Promise.all([
    listRecipes(),
    appDb
      .selectFrom("items")
      .select(["id", "price_cents"])
      .execute(),
  ])

  const inventoryValueCents = items.reduce((sum, item) => sum + item.price_cents, 0)
  const totalCost = recipes.reduce((sum, recipe) => sum + recipe.totalCents, 0)

  return {
    recipeCount: recipes.length,
    itemCount: items.length,
    inventoryValueCents,
    avgRecipeCostCents:
      recipes.length > 0 ? Math.round(totalCost / recipes.length) : 0,
  }
})
