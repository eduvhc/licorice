"use server"

import { revalidatePath } from "next/cache"

import { appDb } from "@/lib/app-db"
import { ACTION_ERROR, type ActionErrorCode } from "@/shared/lib/action-result"

import { priceOfferInputSchema, retailerInputSchema } from "../lib/validation"

export type PricingActionResult =
  { ok: true } | { ok: false; error: ActionErrorCode }

function revalidate() {
  revalidatePath("/", "layout")
}

export async function saveRetailerAction(
  input: unknown,
  id?: number
): Promise<PricingActionResult> {
  const parsed = retailerInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  const values = {
    name: parsed.data.name,
    color: parsed.data.color,
    url: parsed.data.url,
    notes: parsed.data.notes,
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("retailers")
        .set(values)
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: ACTION_ERROR.server }
      }
    } else {
      await appDb.insertInto("retailers").values(values).execute()
    }

    revalidate()
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : ""

    if (message.includes("UNIQUE")) {
      return { ok: false, error: ACTION_ERROR.duplicate }
    }

    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function deleteRetailerAction(
  id: number
): Promise<PricingActionResult> {
  try {
    const offers = await appDb
      .selectFrom("price_offers")
      .select("id")
      .where("retailer_id", "=", id)
      .limit(1)
      .execute()

    if (offers.length > 0) {
      return { ok: false, error: ACTION_ERROR.inUse }
    }

    await appDb.deleteFrom("retailers").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function savePriceOfferAction(
  input: unknown,
  id?: number
): Promise<PricingActionResult> {
  const parsed = priceOfferInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  try {
    const [retailer, item, unit] = await Promise.all([
      appDb
        .selectFrom("retailers")
        .select("id")
        .where("id", "=", parsed.data.retailerId)
        .executeTakeFirst(),
      appDb
        .selectFrom("items")
        .select("id")
        .where("id", "=", parsed.data.itemId)
        .executeTakeFirst(),
      appDb
        .selectFrom("units")
        .select("id")
        .where("id", "=", parsed.data.unitId)
        .executeTakeFirst(),
    ])

    if (!retailer || !item || !unit) {
      return { ok: false, error: ACTION_ERROR.invalid }
    }

    const values = {
      retailer_id: parsed.data.retailerId,
      item_id: parsed.data.itemId,
      quantity: parsed.data.quantity,
      unit_id: parsed.data.unitId,
      price_cents: parsed.data.priceCents,
      valid_on: parsed.data.validOn ?? null,
      url: parsed.data.url,
      notes: parsed.data.notes,
    }

    if (id) {
      const result = await appDb
        .updateTable("price_offers")
        .set(values)
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: ACTION_ERROR.server }
      }
    } else {
      await appDb.insertInto("price_offers").values(values).execute()
    }

    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function deletePriceOfferAction(
  id: number
): Promise<PricingActionResult> {
  try {
    await appDb.deleteFrom("price_offers").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}
