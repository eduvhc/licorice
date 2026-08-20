import { cache } from "react"

import { appDb } from "@/lib/app-db"

import { groupCostBand, type IngredientCost } from "../lib/pricing"

export type RecipeIngredient = {
  itemId: number
  name: string
  unitName: string
  tagColor: string
  quantity: number
  priceCents: number
}

export type RecipeIngredientGroup = {
  /** Primary row (display name + base cost). */
  primary: RecipeIngredient
  /** Optional alternatives; when present, the group's price is a range. */
  alternatives: RecipeIngredient[]
}

export type RecipeWithItems = {
  id: number
  name: string
  description: string
  yieldMl: number
  groups: RecipeIngredientGroup[]
  /** Lowest possible batch cost (cheapest choice per group). */
  totalLowCents: number
  /** Highest possible batch cost (priciest choice per group). */
  totalHighCents: number
  /** True when any group's alt set produces a different cost band. */
  hasRange: boolean
  /** Back-compat aggregate single value = optimistic total. */
  totalCents: number
}

type JoinedRow = {
  recipe_id: number
  primary_id: number | null
  sort_order: number | null
  row_item_id: number
  quantity: number
  name: string
  price_cents: number
  unitName: string
  tagColor: string
}

export const listRecipes = cache(async (): Promise<RecipeWithItems[]> => {
  const recipes = await appDb
    .selectFrom("recipes")
    .select(["id", "name", "description", "yield_ml"])
    .orderBy("id", "desc")
    .execute()

  if (recipes.length === 0) {
    return []
  }

  const primaryRows = await appDb
    .selectFrom("recipe_items as ri")
    .innerJoin("items as i", "i.id", "ri.item_id")
    .innerJoin("units as u", "u.id", "i.unit_id")
    .innerJoin("tags as tg", "tg.id", "i.tag_id")
    .select([
      "ri.recipe_id",
      "ri.id as primary_id",
      "ri.item_id as row_item_id",
      "ri.quantity",
      "i.name",
      "i.price_cents",
      "u.name as unitName",
      "tg.color as tagColor",
    ])
    .orderBy("ri.id", "asc")
    .execute()

  const alternativeRows = await appDb
    .selectFrom("recipe_item_alternatives as ria")
    .innerJoin("items as i", "i.id", "ria.item_id")
    .innerJoin("units as u", "u.id", "i.unit_id")
    .innerJoin("tags as tg", "tg.id", "i.tag_id")
    .select([
      "ria.primary_recipe_item_id",
      "ria.sort_order",
      "ria.item_id as row_item_id",
      "ria.quantity",
      "i.name",
      "i.price_cents",
      "u.name as unitName",
      "tg.color as tagColor",
    ])
    .orderBy("ria.sort_order", "asc")
    .execute()

  const grouped = new Map<number, RecipeIngredientGroup[]>()
  const altsByPrimary = new Map<number, JoinedRow[]>()
  for (const alt of alternativeRows) {
    const bucket = altsByPrimary.get(alt.primary_recipe_item_id) ?? []
    bucket.push({
      recipe_id: 0,
      primary_id: null,
      sort_order: alt.sort_order,
      row_item_id: alt.row_item_id,
      quantity: alt.quantity,
      name: alt.name,
      price_cents: alt.price_cents,
      unitName: alt.unitName,
      tagColor: alt.tagColor,
    })
    altsByPrimary.set(alt.primary_recipe_item_id, bucket)
  }

  for (const row of primaryRows) {
    const bucket = grouped.get(row.recipe_id) ?? []
    const alts = (
      altsByPrimary.get(row.primary_id) ?? []
    ).map<RecipeIngredient>((alt) => ({
      itemId: alt.row_item_id,
      name: alt.name,
      unitName: alt.unitName,
      tagColor: alt.tagColor,
      quantity: alt.quantity,
      priceCents: alt.price_cents,
    }))
    bucket.push({
      primary: {
        itemId: row.row_item_id,
        name: row.name,
        unitName: row.unitName,
        tagColor: row.tagColor,
        quantity: row.quantity,
        priceCents: row.price_cents,
      },
      alternatives: alts,
    })
    grouped.set(row.recipe_id, bucket)
  }

  return recipes.map((recipe) => {
    const groups = grouped.get(recipe.id) ?? []
    let totalLowCents = 0
    let totalHighCents = 0
    let hasRange = false

    for (const group of groups) {
      const candidateCosts: IngredientCost[] = [
        {
          quantity: group.primary.quantity,
          priceCents: group.primary.priceCents,
        },
        ...group.alternatives.map((alt) => ({
          quantity: alt.quantity,
          priceCents: alt.priceCents,
        })),
      ]
      const band = groupCostBand(candidateCosts)
      totalLowCents += band.lowCents
      totalHighCents += band.highCents
      hasRange = hasRange || band.hasRange
    }

    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      yieldMl: recipe.yield_ml,
      groups,
      totalLowCents,
      totalHighCents,
      hasRange,
      totalCents: totalLowCents,
    }
  })
})

export const getRecipe = cache(
  async (id: number): Promise<RecipeWithItems | null> => {
    const recipes = await listRecipes()
    return recipes.find((recipe) => recipe.id === id) ?? null
  }
)

export type DashboardStats = {
  recipeCount: number
  itemCount: number
  inventoryValueCents: number
  avgRecipeLowCents: number
  avgRecipeHighCents: number
  hasRange: boolean
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const [recipes, items] = await Promise.all([
    listRecipes(),
    appDb.selectFrom("items").select(["id", "price_cents"]).execute(),
  ])

  const inventoryValueCents = items.reduce(
    (sum, item) => sum + item.price_cents,
    0
  )
  const totalLow = recipes.reduce(
    (sum, recipe) => sum + recipe.totalLowCents,
    0
  )
  const totalHigh = recipes.reduce(
    (sum, recipe) => sum + recipe.totalHighCents,
    0
  )
  const hasRange = recipes.some((recipe) => recipe.hasRange)

  return {
    recipeCount: recipes.length,
    itemCount: items.length,
    inventoryValueCents,
    avgRecipeLowCents:
      recipes.length > 0 ? Math.round(totalLow / recipes.length) : 0,
    avgRecipeHighCents:
      recipes.length > 0 ? Math.round(totalHigh / recipes.length) : 0,
    hasRange,
  }
})
