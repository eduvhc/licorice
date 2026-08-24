import type { Generated } from "kysely"

export interface ItemsTable {
  id: Generated<number>
  name: string
  price_cents: number
  tag_id: number
  unit_id: number
}

export interface TagsTable {
  id: Generated<number>
  name: string
  color: string
}

export interface UnitsTable {
  id: Generated<number>
  name: string
}

export interface RecipesTable {
  id: Generated<number>
  name: string
  description: string
  yield_ml: number
}

export interface RecipeItemsTable {
  id: Generated<number>
  recipe_id: number
  item_id: number
  quantity: number
}

export interface RecipeItemAlternativesTable {
  id: Generated<number>
  primary_recipe_item_id: number
  item_id: number
  quantity: number
  sort_order: number
}

export interface BottlesTable {
  id: Generated<number>
  name: string
  size_ml: number
  price_cents: number
}

export type AppSchema = {
  items: ItemsTable
  recipes: RecipesTable
  recipe_items: RecipeItemsTable
  recipe_item_alternatives: RecipeItemAlternativesTable
  tags: TagsTable
  units: UnitsTable
  bottles: BottlesTable
}
