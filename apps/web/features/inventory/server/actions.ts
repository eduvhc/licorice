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
      return { ok: false, error: "invalid" }
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
        return { ok: false, error: "server" }
      }
    } else {
      await appDb.insertInto("items").values(values).execute()
    }

    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: "server" }
  }
}

export async function deleteItemAction(id: number): Promise<ActionResult> {
  try {
    await appDb.deleteFrom("items").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: "server" }
  }
}
