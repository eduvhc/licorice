import path from "node:path"

import Database from "better-sqlite3"
import { Kysely, SqliteDialect, type Generated } from "kysely"

export interface ItemsTable {
  id: Generated<number>
  name: string
  unit: string
  price_cents: number
  type: string
}

export interface RecipesTable {
  id: Generated<number>
  name: string
  description: string
}

export interface RecipeItemsTable {
  id: Generated<number>
  recipe_id: number
  item_id: number
  quantity: number
}

type AppSchema = {
  items: ItemsTable
  recipes: RecipesTable
  recipe_items: RecipeItemsTable
}

const sqlite = new Database(path.join(process.cwd(), "app.db"))

export const appDb = new Kysely<AppSchema>({
  dialect: new SqliteDialect({
    database: sqlite,
  }),
})
