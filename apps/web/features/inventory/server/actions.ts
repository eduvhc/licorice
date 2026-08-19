"use server"

import { revalidatePath } from "next/cache"

import { appDb } from "@/lib/app-db"
import { ACTION_ERROR, type ActionErrorCode } from "@/shared/lib/action-result"

import { itemInputSchema } from "../lib/validation"

export type ActionResult =
  | { ok: true }
  | { ok: false; error: Extract<ActionErrorCode, "invalid" | "server"> }
  | {
      ok: false
      error: Extract<ActionErrorCode, "inUse">
      recipes: { id: number; name: string }[]
    }

function revalidate() {
  revalidatePath("/", "layout")
}

export async function saveItemAction(
  input: unknown,
  id?: number
): Promise<ActionResult> {
  const parsed = itemInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  try {
    const [tag, unit] = await Promise.all([
      appDb
        .selectFrom("tags")
        .select("id")
        .where("id", "=", parsed.data.tagId)
        .executeTakeFirst(),
      appDb
        .selectFrom("units")
        .select("id")
        .where("id", "=", parsed.data.unitId)
        .executeTakeFirst(),
    ])

    if (!tag || !unit) {
      return { ok: false, error: ACTION_ERROR.invalid }
    }

    const values = {
      name: parsed.data.name,
      price_cents: parsed.data.priceCents,
      tag_id: parsed.data.tagId,
      unit_id: parsed.data.unitId,
    }

    if (id) {
      const result = await appDb
        .updateTable("items")
        .set(values)
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: ACTION_ERROR.server }
      }
    } else {
      await appDb.insertInto("items").values(values).execute()
    }

    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function deleteItemAction(id: number): Promise<ActionResult> {
  try {
    const recipes = await appDb
      .selectFrom("recipe_items as ri")
      .innerJoin("recipes as r", "r.id", "ri.recipe_id")
      .select(["r.id", "r.name"])
      .distinct()
      .where("ri.item_id", "=", id)
      .orderBy("r.name")
      .execute()

    if (recipes.length > 0) {
      return { ok: false, error: ACTION_ERROR.inUse, recipes }
    }

    await appDb.deleteFrom("items").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}
