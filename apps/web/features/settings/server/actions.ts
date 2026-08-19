"use server"

import { revalidatePath } from "next/cache"

import { appDb } from "@/lib/app-db"

import { tagInputSchema, unitInputSchema } from "../lib/validation"

export type SettingsActionResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "inUse" | "duplicate" | "server" }

function revalidate() {
  revalidatePath("/", "layout")
}

export async function saveTagAction(
  input: unknown,
  id?: number
): Promise<SettingsActionResult> {
  const parsed = tagInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: "invalid" }
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("tags")
        .set({ name: parsed.data.name, color: parsed.data.color })
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: "server" }
      }
    } else {
      await appDb.insertInto("tags").values(parsed.data).execute()
    }

    revalidate()
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : ""

    if (message.includes("UNIQUE")) {
      return { ok: false, error: "duplicate" }
    }

    return { ok: false, error: "server" }
  }
}

export async function deleteTagAction(id: number): Promise<SettingsActionResult> {
  try {
    const items = await appDb
      .selectFrom("items")
      .select("id")
      .where("tag_id", "=", id)
      .limit(1)
      .execute()

    if (items.length > 0) {
      return { ok: false, error: "inUse" }
    }

    await appDb.deleteFrom("tags").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: "server" }
  }
}

export async function saveUnitAction(
  input: unknown,
  id?: number
): Promise<SettingsActionResult> {
  const parsed = unitInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, error: "invalid" }
  }

  try {
    if (id) {
      const result = await appDb
        .updateTable("units")
        .set({ name: parsed.data.name })
        .where("id", "=", id)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        return { ok: false, error: "server" }
      }
    } else {
      await appDb.insertInto("units").values(parsed.data).execute()
    }

    revalidate()
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : ""

    if (message.includes("UNIQUE")) {
      return { ok: false, error: "duplicate" }
    }

    return { ok: false, error: "server" }
  }
}

export async function deleteUnitAction(id: number): Promise<SettingsActionResult> {
  try {
    const items = await appDb
      .selectFrom("items")
      .select("id")
      .where("unit_id", "=", id)
      .limit(1)
      .execute()

    if (items.length > 0) {
      return { ok: false, error: "inUse" }
    }

    await appDb.deleteFrom("units").where("id", "=", id).execute()
    revalidate()
    return { ok: true }
  } catch {
    return { ok: false, error: "server" }
  }
}
