import { cache } from "react"

import { appDb } from "@/lib/app-db"

import type { ItemType } from "../lib/item-types"

export type Item = {
  id: number
  name: string
  unit: string
  price_cents: number
  type: ItemType
}

export const listItems = cache(async (): Promise<Item[]> => {
  return appDb
    .selectFrom("items")
    .select(["id", "name", "unit", "price_cents", "type"])
    .orderBy("name")
    .execute() as Promise<Item[]>
})

export const getItem = cache(async (id: number): Promise<Item | null> => {
  const row = await appDb
    .selectFrom("items")
    .select(["id", "name", "unit", "price_cents", "type"])
    .where("id", "=", id)
    .executeTakeFirst()

  return (row as Item | undefined) ?? null
})

export async function itemExists(id: number) {
  const row = await appDb
    .selectFrom("items")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst()

  return Boolean(row)
}
