/**
 * Pure per-retailer basket costing.
 *
 * A recipe is made of ingredient groups; each group has a primary ingredient
 * and any number of alternatives. A retailer's basket for the recipe is the
 * sum of the cheapest (low) and most expensive (high) way to buy each group if
 * that retailer stocks the ingredient. A group that no offer at the retailer
 * covers is "unavailable", and it reduces the recipe's coverage there.
 *
 * The rest of the feature is thin: the server query loads offers and calls
 * these functions, so the decisions stay here where they can be unit-tested.
 */

export type IngredientCandidate = {
  itemId: number
  /** Amount needed for one batch, in the ingredient's unit. */
  quantity: number
}

export type OfferPrice = {
  itemId: number
  retailerId: number
  /** Package amount, in the item's unit. */
  quantity: number
  /** Price of that package, in cents. */
  priceCents: number
}

export type BasketGroupResult = {
  lowCents: number
  highCents: number
  hasRange: boolean
  available: boolean
}

export type RetailerBasket = {
  retailerId: number
  totalLowCents: number
  totalHighCents: number
  hasRange: boolean
  /** 0..1 fraction of groups the retailer can fully price. */
  coverage: number
}

function perUnitCents(offer: Pick<OfferPrice, "quantity" | "priceCents">) {
  if (offer.quantity <= 0) return Number.POSITIVE_INFINITY
  return offer.priceCents / offer.quantity
}

/**
 * The cheapest per-unit offer for an item at a retailer. Returns null when the
 * retailer has no offer for the item.
 */
function bestPerUnitAtRetailer(
  itemId: number,
  retailerId: number,
  offers: OfferPrice[]
): number | null {
  let best = Number.POSITIVE_INFINITY
  for (const offer of offers) {
    if (offer.itemId !== itemId || offer.retailerId !== retailerId) continue
    const perUnit = perUnitCents(offer)
    if (perUnit < best) best = perUnit
  }
  return Number.isFinite(best) ? best : null
}

/** Cost band for one group at a retailer, or null when nothing is available. */
export function groupBasket(
  candidates: IngredientCandidate[],
  retailerId: number,
  offers: OfferPrice[]
): BasketGroupResult | null {
  const costs: number[] = []
  for (const candidate of candidates) {
    const perUnit = bestPerUnitAtRetailer(candidate.itemId, retailerId, offers)
    if (perUnit === null) continue
    costs.push(Math.round(candidate.quantity * perUnit))
  }

  if (costs.length === 0) return null

  const lowCents = Math.min(...costs)
  const highCents = Math.max(...costs)
  return {
    lowCents,
    highCents,
    hasRange: costs.length > 1 && lowCents !== highCents,
    available: true,
  }
}

/**
 * Full recipe basket for every retailer that has at least one relevant offer.
 * Retailers with no coverage at all are omitted.
 */
export function recipeBaskets(
  groups: IngredientCandidate[][],
  retailerIds: number[],
  offers: OfferPrice[]
): RetailerBasket[] {
  const baskets: RetailerBasket[] = []

  for (const retailerId of retailerIds) {
    let totalLow = 0
    let totalHigh = 0
    let hasRange = false
    let pricedGroups = 0

    for (const group of groups) {
      const result = groupBasket(group, retailerId, offers)
      if (!result) continue
      totalLow += result.lowCents
      totalHigh += result.highCents
      hasRange = hasRange || result.hasRange
      pricedGroups++
    }

    if (pricedGroups === 0) continue

    baskets.push({
      retailerId,
      totalLowCents: totalLow,
      totalHighCents: totalHigh,
      hasRange,
      coverage: pricedGroups / groups.length,
    })
  }

  return baskets.sort((a, b) => a.totalLowCents - b.totalLowCents)
}
