import { cache } from "react"

import { appDb } from "@/lib/app-db"

export type Tag = {
  id: number
  name: string
  color: string
}

export type Unit = {
  id: number
  name: string
}

export type Bottle = {
  id: number
  name: string
  sizeMl: number
  priceCents: number
}

export const listTags = cache(async (): Promise<Tag[]> => {
  return appDb
    .selectFrom("tags")
    .select(["id", "name", "color"])
    .orderBy("id")
    .execute()
})

export const listUnits = cache(async (): Promise<Unit[]> => {
  return appDb
    .selectFrom("units")
    .select(["id", "name"])
    .orderBy("id")
    .execute()
})

export const listBottles = cache(async (): Promise<Bottle[]> => {
  const rows = await appDb
    .selectFrom("bottles")
    .select(["id", "name", "size_ml", "price_cents"])
    .orderBy("size_ml")
    .execute()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sizeMl: row.size_ml,
    priceCents: row.price_cents,
  }))
})

export async function countItemsWithTag(tagId: number) {
  const row = await appDb
    .selectFrom("items")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("tag_id", "=", tagId)
    .executeTakeFirstOrThrow()

  return Number(row.count)
}

export async function countItemsWithUnit(unitId: number) {
  const row = await appDb
    .selectFrom("items")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("unit_id", "=", unitId)
    .executeTakeFirstOrThrow()

  return Number(row.count)
}
