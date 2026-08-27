import { describe, expect, it } from "vitest"

import { groupBasket, recipeBaskets } from "./baskets"

const offers = [
  // Vodka 700 ml = €7.90 (Continente)
  { itemId: 1, retailerId: 1, quantity: 700, priceCents: 790 },
  // Vodka 700 ml = €7.49 (Lidl)
  { itemId: 1, retailerId: 2, quantity: 700, priceCents: 749 },
  // Vodka 0.5 g? no — a small 100 ml = €1.49 (Continente), cheaper per ml
  { itemId: 1, retailerId: 1, quantity: 100, priceCents: 149 },
  // Whiskey 700 ml = €13.49 (Continente)
  { itemId: 2, retailerId: 1, quantity: 700, priceCents: 1349 },
  // Whiskey 700 ml = €11.99 (Lidl)
  { itemId: 2, retailerId: 2, quantity: 700, priceCents: 1199 },
  // Whipped cream not priced anywhere
  { itemId: 3, retailerId: 1, quantity: 200, priceCents: 999 },
]

describe("groupBasket", () => {
  it("returns a single cost when only one candidate is available", () => {
    const result = groupBasket([{ itemId: 2, quantity: 250 }], 2, offers)
    expect(result).toEqual({
      lowCents: Math.round(250 * (1199 / 700)),
      highCents: Math.round(250 * (1199 / 700)),
      hasRange: false,
      available: true,
    })
  })

  it("picks the cheapest per-unit for the same item", () => {
    // Continental has 700 ml @790 and 100 ml @149; 700 ml is cheaper per ml.
    const result = groupBasket([{ itemId: 1, quantity: 700 }], 1, offers)
    expect(result?.lowCents).toBe(790)
    expect(result?.highCents).toBe(790)
  })

  it("returns null when the retailer stocks nothing", () => {
    const result = groupBasket([{ itemId: 3, quantity: 100 }], 2, offers)
    expect(result).toBeNull()
  })
})

describe("recipeBaskets", () => {
  it("sorts by lowest cost and keeps coverage", () => {
    // Group A: vodka (item 1); Group B: whiskey (item 2).
    const groups = [
      [{ itemId: 1, quantity: 700 }],
      [{ itemId: 2, quantity: 250 }],
    ]
    const baskets = recipeBaskets(groups, [1, 2], offers)

    expect(baskets).toHaveLength(2)
    expect(baskets[0]!.retailerId).toBe(2) // Lidl cheaper (vodka+whiskey)
    expect(baskets[1]!.retailerId).toBe(1)
    expect(baskets[0]!.coverage).toBe(1)
  })

  it("omits retailers with zero coverage", () => {
    const groups = [[{ itemId: 3, quantity: 100 }]]
    const baskets = recipeBaskets(groups, [2], offers)
    expect(baskets).toHaveLength(0)
  })
})
