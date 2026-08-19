"use server"

import { revalidatePath } from "next/cache"

import { appDb } from "@/lib/app-db"

import { itemInputSchema } from "../lib/validation"

export type ActionResult = { ok: true } | { ok: false; error: "invalid" | "server" }

function revalidate() {
  revalidatePath("/", "layout")
}

export async function saveItemAction(
  input: unknown,
  id?: number
): Promise<ActionResult> {
  const parsed = itemInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: "invalid" }
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("items")
        .set({
          name: parsed.data.name,
          unit: parsed.data.unit,
          price_cents: parsed.data.priceCents,
          type: parsed.data.type,
        })
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: "server" }
      }
    } else {
      await appDb
        .insertInto("items")
        .values({
          name: parsed.data.name,
          unit: parsed.data.unit,
          price_cents: parsed.data.priceCents,
          type: parsed.data.type,
        })
        .execute()
    }

    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: "server" }
  }
}

export async function deleteItemAction(id: number): Promise<ActionResult> {
  try {    await appDb.deleteFrom("items").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: "server" }
  }
}
