"use server"

import { revalidatePath } from "next/cache"

import { appDb } from "@/lib/app-db"
import { ACTION_ERROR, type ActionErrorCode } from "@/shared/lib/action-result"

import {
  bottleInputSchema,
  tagInputSchema,
  unitInputSchema,
} from "../lib/validation"

export type SettingsActionResult =
  { ok: true } | { ok: false; error: ActionErrorCode }

function revalidate() {
  revalidatePath("/", "layout")
}

export async function saveTagAction(
  input: unknown,
  id?: number
): Promise<SettingsActionResult> {
  const parsed = tagInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("tags")
        .set({ name: parsed.data.name, color: parsed.data.color })
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: ACTION_ERROR.server }
      }
    } else {
      await appDb.insertInto("tags").values(parsed.data).execute()
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

export async function deleteTagAction(
  id: number
): Promise<SettingsActionResult> {
  try {
    const items = await appDb
      .selectFrom("items")
      .select("id")
      .where("tag_id", "=", id)
      .limit(1)
      .execute()

    if (items.length > 0) {
      return { ok: false, error: ACTION_ERROR.inUse }
    }

    await appDb.deleteFrom("tags").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function saveUnitAction(
  input: unknown,
  id?: number
): Promise<SettingsActionResult> {
  const parsed = unitInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("units")
        .set({ name: parsed.data.name })
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: ACTION_ERROR.server }
      }
    } else {
      await appDb.insertInto("units").values(parsed.data).execute()
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

export async function deleteUnitAction(
  id: number
): Promise<SettingsActionResult> {
  try {
    const items = await appDb
      .selectFrom("items")
      .select("id")
      .where("unit_id", "=", id)
      .limit(1)
      .execute()

    if (items.length > 0) {
      return { ok: false, error: ACTION_ERROR.inUse }
    }

    await appDb.deleteFrom("units").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function saveBottleAction(
  input: unknown,
  id?: number
): Promise<SettingsActionResult> {
  const parsed = bottleInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: ACTION_ERROR.invalid }
  }

  const values = {
    name: parsed.data.name,
    size_ml: parsed.data.sizeMl,
    price_cents: parsed.data.priceCents,
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("bottles")
        .set(values)
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: ACTION_ERROR.server }
      }
    } else {
      await appDb.insertInto("bottles").values(values).execute()
    }

    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}

export async function deleteBottleAction(
  id: number
): Promise<SettingsActionResult> {
  try {
    await appDb.deleteFrom("bottles").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: ACTION_ERROR.server }
  }
}
