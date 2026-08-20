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
    const itemIds = new Set<number>()
    for (const group of parsed.data.groups) {
      itemIds.add(group.primary.itemId)
      for (const alt of group.alternatives) itemIds.add(alt.itemId)
    }

    for (const itemId of itemIds) {
      if (!(await itemExists(itemId))) {
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

      for (const group of parsed.data.groups) {
        const primaryInsert = await trx
          .insertInto("recipe_items")
          .values({
            recipe_id: recipeId!,
            item_id: group.primary.itemId,
            quantity: group.primary.quantity,
          })
          .returning("id")
          .executeTakeFirstOrThrow()

        if (group.alternatives.length > 0) {
          await trx
            .insertInto("recipe_item_alternatives")
            .values(
              group.alternatives.map((alt, sortOrder) => ({
                primary_recipe_item_id: primaryInsert.id,
                item_id: alt.itemId,
                quantity: alt.quantity,
                sort_order: sortOrder + 1,
              }))
            )
            .execute()
        }
      }
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
