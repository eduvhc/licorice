import { appDb } from "../lib/app-db"

const RETAILERS = [
  { name: "Continente", color: "emerald", url: "https://www.continente.pt" },
  { name: "Pingo Doce", color: "orange", url: "https://www.pingodoce.pt" },
  { name: "Lidl", color: "amber", url: "https://www.lidl.pt" },
  { name: "Auchan", color: "violet", url: "https://www.auchan.pt" },
  { name: "Mercadona", color: "rose", url: "https://www.mercadona.pt" },
  { name: "Intermarché", color: "sky", url: "https://www.intermarche.pt" },
  { name: "Spar", color: "lime", url: "https://www.spar.pt" },
] as const

/**
 * Illustrative per-package offers. Only inserted when pass `--sample` (or
 * `SEED_PRICES_SAMPLE=1`); real prices come from the manager UI. Each offer is
 * matched to an item by name and carries the package size + price for that
 * retailer, proving the per-retailer basket costing end to end.
 */
const SAMPLE_OFFERS: {
  retailer: string
  item: string
  quantity: number
  price_cents: number
  url?: string
}[] = [
  { retailer: "Continente", item: "Vodka", quantity: 700, price_cents: 790 },
  { retailer: "Pingo Doce", item: "Vodka", quantity: 700, price_cents: 829 },
  { retailer: "Lidl", item: "Vodka", quantity: 700, price_cents: 749 },
  { retailer: "Continente", item: "Whiskey", quantity: 700, price_cents: 1349 },
  { retailer: "Lidl", item: "Whiskey", quantity: 700, price_cents: 1199 },
]

async function main() {
  const sample =
    process.argv.includes("--sample") || process.env.SEED_PRICES_SAMPLE === "1"

  const existing = await appDb
    .selectFrom("retailers")
    .select(["id", "name"])
    .execute()
  const byName = new Map(existing.map((r) => [r.name, r.id]))

  for (const retailer of RETAILERS) {
    if (byName.has(retailer.name)) {
      await appDb
        .updateTable("retailers")
        .set({ color: retailer.color, url: retailer.url })
        .where("name", "=", retailer.name)
        .execute()
    } else {
      const inserted = await appDb
        .insertInto("retailers")
        .values({
          name: retailer.name,
          color: retailer.color,
          url: retailer.url,
          notes: "",
        })
        .returning("id")
        .executeTakeFirstOrThrow()
      byName.set(retailer.name, inserted.id)
    }
  }

  console.log(`seeded ${RETAILERS.length} retailers`)

  if (sample) {
    const items = await appDb
      .selectFrom("items")
      .select(["items.id", "items.name", "items.unit_id"])
      .execute()

    const itemByName = new Map(
      items.map((item) => [normalizeName(item.name), item])
    )

    let offers = 0
    for (const offer of SAMPLE_OFFERS) {
      const retailerId = byName.get(offer.retailer)
      const item = itemByName.get(normalizeName(offer.item))
      if (!retailerId || !item) continue

      await appDb
        .insertInto("price_offers")
        .values({
          retailer_id: retailerId,
          item_id: item.id,
          quantity: offer.quantity,
          unit_id: item.unit_id,
          price_cents: offer.price_cents,
          valid_on: null,
          url: offer.url ?? "",
          notes: "",
        })
        .execute()
      offers++
    }
    console.log(`inserted ${offers} sample price offers`)
  }

  const count = await appDb
    .selectFrom("retailers")
    .select((eb) => eb.fn.countAll<number>().as("n"))
    .executeTakeFirstOrThrow()
  console.log(`retailers now: ${count.n}`)
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
