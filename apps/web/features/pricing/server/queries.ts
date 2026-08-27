import { cache } from "react"

import { appDb } from "@/lib/app-db"
import { getRecipe } from "@/features/recipes/server/queries"

import {
  recipeBaskets,
  type OfferPrice,
  type RetailerBasket,
} from "../lib/baskets"

export type Retailer = {
  id: number
  name: string
  color: string
  url: string
  notes: string
}

export type PriceOffer = {
  id: number
  retailerId: number
  retailerName: string
  retailerColor: string
  itemId: number
  itemName: string
  unitId: number
  unitName: string
  quantity: number
  priceCents: number
  validOn: string | null
  url: string
  notes: string
}

export type RetailerBasketWithMeta = RetailerBasket & {
  retailerName: string
  retailerColor: string
}

export const listRetailers = cache(async (): Promise<Retailer[]> => {
  return appDb
    .selectFrom("retailers")
    .select(["id", "name", "color", "url", "notes"])
    .orderBy("name")
    .execute()
})

export const listPriceOffers = cache(async (): Promise<PriceOffer[]> => {
  const rows = await appDb
    .selectFrom("price_offers as po")
    .innerJoin("retailers as r", "r.id", "po.retailer_id")
    .innerJoin("items as i", "i.id", "po.item_id")
    .innerJoin("units as u", "u.id", "po.unit_id")
    .select([
      "po.id",
      "po.retailer_id",
      "r.name as retailerName",
      "r.color as retailerColor",
      "po.item_id",
      "i.name as itemName",
      "u.name as unitName",
      "po.unit_id",
      "po.quantity",
      "po.price_cents",
      "po.valid_on",
      "po.url",
      "po.notes",
    ])
    .orderBy(["r.name", "i.name"])
    .execute()

  return rows.map((row) => ({
    id: row.id,
    retailerId: row.retailer_id,
    retailerName: row.retailerName,
    retailerColor: row.retailerColor,
    itemId: row.item_id,
    itemName: row.itemName,
    unitId: row.unit_id,
    unitName: row.unitName,
    quantity: row.quantity,
    priceCents: row.price_cents,
    validOn: row.valid_on,
    url: row.url,
    notes: row.notes,
  }))
})

export const getRecipeRetailerBaskets = cache(
  async (recipeId: number): Promise<RetailerBasketWithMeta[]> => {
    const recipe = await getRecipe(recipeId)
    if (!recipe) return []

    const itemIds = new Set<number>()
    for (const group of recipe.groups) {
      itemIds.add(group.primary.itemId)
      for (const alt of group.alternatives) itemIds.add(alt.itemId)
    }

    if (itemIds.size === 0) return []

    const [offerRows, retailers] = await Promise.all([
      appDb
        .selectFrom("price_offers")
        .select(["item_id", "retailer_id", "quantity", "price_cents"])
        .where("item_id", "in", [...itemIds])
        .execute(),
      appDb
        .selectFrom("retailers")
        .select(["id", "name", "color"])
        .orderBy("name")
        .execute(),
    ])

    const offers: OfferPrice[] = offerRows.map((row) => ({
      itemId: row.item_id,
      retailerId: row.retailer_id,
      quantity: row.quantity,
      priceCents: row.price_cents,
    }))

    const groups = recipe.groups.map((group) => [
      { itemId: group.primary.itemId, quantity: group.primary.quantity },
      ...group.alternatives.map((alt) => ({
        itemId: alt.itemId,
        quantity: alt.quantity,
      })),
    ])

    const retailerById = new Map(
      retailers.map((retailer) => [retailer.id, retailer])
    )
    const baskets = recipeBaskets(
      groups,
      retailers.map((retailer) => retailer.id),
      offers
    )

    return baskets.map((basket) => ({
      ...basket,
      retailerName: retailerById.get(basket.retailerId)?.name ?? "",
      retailerColor: retailerById.get(basket.retailerId)?.color ?? "zinc",
    }))
  }
)
