"use server"

import { revalidatePath } from "next/cache"

import { appDb } from "@/lib/app-db"
import { itemExists } from "@/features/inventory/server/queries"
import { ACTION_ERROR, type ActionErrorCode } from "@/shared/lib/action-result"

import { recipeInputSchema } from "../lib/validation"

export type ActionResult =
  | { ok: true }
  | { ok: false; error: Extract<ActionErrorCode, "invalid" | "server"> }

export async function saveRecipeAction(
  input: unknown,
  id?: number
): Promise<ActionResult> {
  const parsed = recipeInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  try {
    for (const item of parsed.data.items) {
      if (!(await itemExists(item.itemId))) {
        return { ok: false, error: ACTION_ERROR.invalid }
      }
    }

    await appDb.transaction().execute(async (trx) => {
      let recipeId = id

      if (recipeId) {
        await trx
          .updateTable("recipes")
          .set({
            name: parsed.data.name,
            description: parsed.data.description,
            yield_ml: parsed.data.yieldMl,
          })
          .where("id", "=", recipeId)
          .execute()
        await trx
          .deleteFrom("recipe_items")
          .where("recipe_id", "=", recipeId)
          .execute()
      } else {
        const inserted = await trx
          .insertInto("recipes")
          .values({
            name: parsed.data.name,
            description: parsed.data.description,
            yield_ml: parsed.data.yieldMl,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
        recipeId = inserted.id
      }

      await trx
        .insertInto("recipe_items")
        .values(
          parsed.data.items.map((item) => ({
            recipe_id: recipeId!,
            item_id: item.itemId,
            quantity: item.quantity,
          }))
        )
        .execute()
    })

    revalidatePath("/", "layout")
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function deleteRecipeAction(id: number): Promise<ActionResult> {
  try {
    await appDb.deleteFrom("recipes").where("id", "=", id).execute()
    revalidatePath("/", "layout")
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}
