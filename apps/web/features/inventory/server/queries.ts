import { cache } from "react"

import { appDb } from "@/lib/app-db"
import type { Tag, Unit } from "@/features/settings/server/queries"

export type Item = {
  id: number
  name: string
  price_cents: number
  tag: Tag
  unit: Unit
}

export const listItems = cache(async (): Promise<Item[]> => {
  const rows = await appDb
    .selectFrom("items")
    .innerJoin("tags", "tags.id", "items.tag_id")
    .innerJoin("units", "units.id", "items.unit_id")
    .select([
      "items.id",
      "items.name",
      "items.price_cents",
      "tags.id as tagId",
      "tags.name as tagName",
      "tags.color as tagColor",
      "units.id as unitId",
      "units.name as unitName",
    ])
    .orderBy("items.name")
    .execute()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price_cents: row.price_cents,
    tag: { id: row.tagId, name: row.tagName, color: row.tagColor },
    unit: { id: row.unitId, name: row.unitName },
  }))
})

export const getItem = cache(async (id: number): Promise<Item | null> => {
  const items = await listItems()
  return items.find((item) => item.id === id) ?? null
})

export async function itemExists(id: number) {
  const row = await appDb
    .selectFrom("items")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst()

  return Boolean(row)
}
