import { appDb } from "../lib/app-db"
import {
  categoryForItemName,
  isCategoryName,
  type CategoryName,
} from "@/features/settings/lib/tag-rules"

const FALLBACK_NAMES: CategoryName[] = [
  "Bebida alcoólica",
  "Outra bebida",
  "Adoçante",
  "Laticínio",
  "Fruta",
  "Especiaria",
  "Café/Chá",
  "Acessório",
  "Outro",
]

async function main() {
  const [tags, items] = await Promise.all([
    appDb.selectFrom("tags").select(["id", "name"]).execute(),
    appDb.selectFrom("items").select(["id", "name", "tag_id"]).execute(),
  ])

  const tagIdByName = new Map(tags.map((tag) => [tag.name, tag.id]))
  const available = new Set(tags.map((tag) => tag.name).filter(isCategoryName))

  if (available.size === 0) {
    throw new Error(
      "No new PT categories found in tags table. Run db:migrate before refreshing tags."
    )
  }
  void FALLBACK_NAMES

  const fallbackTagId = tagIdByName.get("Outro") ?? 0

  let updated = 0
  let unchanged = 0
  let unclassified = 0

  await appDb.transaction().execute(async (trx) => {
    for (const item of items) {
      const candidate = categoryForItemName(item.name)
      const tagName =
        isCategoryName(candidate) && available.has(candidate)
          ? candidate
          : "Outro"
      const targetId = tagIdByName.get(tagName) ?? fallbackTagId

      if (!targetId) {
        unclassified++
        continue
      }

      if (item.tag_id === targetId) {
        unchanged++
        continue
      }

      await trx
        .updateTable("items")
        .set({ tag_id: targetId })
        .where("id", "=", item.id)
        .execute()
      updated++
    }
  })

  console.log(
    `Updated ${updated} items; ${unchanged} already correct; ${unclassified} could not be routed`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
