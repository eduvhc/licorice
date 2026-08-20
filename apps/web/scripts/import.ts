import { appDb } from "../lib/app-db"
import {
  categoryForItemName,
  isCategoryName,
} from "@/features/settings/lib/tag-rules"
import {
  guessTag,
  normalizeName,
  parseIngredientGroup,
  RECIPES,
  UNIT_NAMES,
} from "./import-recipes"

const PRIMARY_TAG_NAME = "Outro"

type ResolvedItem = {
  unitId: number
  itemId: number
}

async function main() {
  await appDb.transaction().execute(async (trx) => {
    await trx.deleteFrom("recipe_item_alternatives").execute()
    await trx.deleteFrom("recipe_items").execute()
    await trx.deleteFrom("recipes").execute()

    const [tags, units, items] = await Promise.all([
      trx.selectFrom("tags").select(["id", "name"]).execute(),
      trx.selectFrom("units").select(["id", "name"]).execute(),
      trx
        .selectFrom("items")
        .innerJoin("units", "units.id", "items.unit_id")
        .select(["items.id", "items.name", "units.name as unit"])
        .execute(),
    ])

    const tagIdByName = new Map(tags.map((tag) => [tag.name, tag.id]))
    const unitIdByName = new Map(units.map((unit) => [unit.name, unit.id]))

    for (const unitName of UNIT_NAMES) {
      if (!unitIdByName.has(unitName)) {
        const inserted = await trx
          .insertInto("units")
          .values({ name: unitName })
          .returning("id")
          .executeTakeFirstOrThrow()
        unitIdByName.set(unitName, inserted.id)
      }
    }

    const fallbackTagId =
      tagIdByName.get(PRIMARY_TAG_NAME) ?? tagIdByName.get("Outro") ?? 0

    const existingItemIds = new Map<string, number>()
    for (const item of items) {
      existingItemIds.set(
        `${item.unit}\u0000${normalizeName(item.name)}`,
        item.id
      )
    }

    const itemCache = new Map<string, ResolvedItem>()

    function classifyTag(name: string) {
      const tagName = categoryForItemName(name)
      if (isCategoryName(tagName) && tagIdByName.has(tagName)) {
        return { tagName, tagId: tagIdByName.get(tagName) ?? fallbackTagId }
      }
      const fallback = guessTag(name)
      return {
        tagName: fallback,
        tagId: tagIdByName.get(fallback) ?? fallbackTagId,
      }
    }

    async function resolveItem(item: {
      quantity: number
      unit: "ml" | "g" | "un"
      name: string
    }) {
      const key = `${item.unit}\u0000${normalizeName(item.name)}`
      const cached = itemCache.get(key)
      if (cached) return cached

      const existing = existingItemIds.get(key)
      if (existing) {
        const unitRow = [...unitIdByName.entries()].find(
          ([name]) => name === item.unit
        )
        const resolved: ResolvedItem = {
          unitId: unitRow?.[1] ?? 0,
          itemId: existing,
        }
        itemCache.set(key, resolved)
        return resolved
      }

      const { tagName, tagId } = classifyTag(item.name)
      const unitId = unitIdByName.get(item.unit) ?? 0
      const inserted = await trx
        .insertInto("items")
        .values({
          name: item.name,
          price_cents: 0,
          tag_id: tagId,
          unit_id: unitId,
        })
        .returning("id")
        .executeTakeFirstOrThrow()

      const resolved: ResolvedItem = { unitId, itemId: inserted.id }
      itemCache.set(key, resolved)
      existingItemIds.set(key, inserted.id)
      void tagName
      return resolved
    }

    for (const recipe of RECIPES) {
      const recipeGroups = recipe.ingredientes.map((line) =>
        parseIngredientGroup(line)
      )

      const insertedRecipe = await trx
        .insertInto("recipes")
        .values({
          name: recipe.nome,
          description: "",
          yield_ml: 1000,
        })
        .returning("id")
        .executeTakeFirstOrThrow()

      const recipeItemRows: {
        recipe_id: number
        item_id: number
        quantity: number
      }[] = []
      const alternativeRows: {
        primary_recipe_item_id: number
        item_id: number
        quantity: number
        sort_order: number
      }[] = []

      for (const group of recipeGroups) {
        const primaryResolved = await resolveItem(group.primary)
        const newPrimaryRow = {
          recipe_id: insertedRecipe.id,
          item_id: primaryResolved.itemId,
          quantity: group.primary.quantity,
        }
        recipeItemRows.push(newPrimaryRow)
      }

      if (recipeItemRows.length > 0) {
        const insertedPrimaries = await trx
          .insertInto("recipe_items")
          .values(recipeItemRows)
          .returning("id")
          .execute()

        for (const [groupIndex, group] of recipeGroups.entries()) {
          const primaryRowId = insertedPrimaries[groupIndex]?.id
          if (!primaryRowId || group.alternatives.length === 0) continue
          for (const [altIndex, alternative] of group.alternatives.entries()) {
            const resolved = await resolveItem(alternative)
            alternativeRows.push({
              primary_recipe_item_id: primaryRowId,
              item_id: resolved.itemId,
              quantity: alternative.quantity,
              sort_order: altIndex + 1,
            })
          }
        }
      }

      if (alternativeRows.length > 0) {
        await trx
          .insertInto("recipe_item_alternatives")
          .values(alternativeRows)
          .execute()
      }
    }
  })

  const [recipes, items, recipeItems, units, alts] = await Promise.all([
    appDb.selectFrom("recipes").select(["id", "name"]).execute(),
    appDb.selectFrom("items").select(["id", "name"]).execute(),
    appDb.selectFrom("recipe_items").select(["id"]).execute(),
    appDb.selectFrom("units").select(["id", "name"]).execute(),
    appDb.selectFrom("recipe_item_alternatives").select(["id"]).execute(),
  ])

  console.log(`imported ${recipes.length} recipes`)
  console.log(`items: ${items.length}`)
  console.log(`recipe_items: ${recipeItems.length}`)
  console.log(`alternatives: ${alts.length}`)
  console.log(`units: ${units.map((unit) => unit.name).join(", ")}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
