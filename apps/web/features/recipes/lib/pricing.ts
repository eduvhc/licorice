export const DEFAULT_MARGIN_PERCENT = 65
export const MIN_MARGIN_PERCENT = 0
export const MAX_MARGIN_PERCENT = 95

export const DEFAULT_YIELD_ML = 1000

export const MIN_BATCH_ML = 1
export const MAX_BATCH_ML = 1000000

/** Units that come in whole, indivisible pieces (e.g. a lemon) — scaling them
 * to a fraction is a waste warning, unlike measurable units (ml, g, cl...). */
export const DISCRETE_UNIT_NAMES = ["un"]

export function costForVolume(costPerMl: number, volumeMl: number) {
  return Math.round(costPerMl * volumeMl)
}

export function needsWholeUnitWarning(unitName: string, quantity: number) {
  if (!DISCRETE_UNIT_NAMES.includes(unitName)) return false
  return Math.abs(quantity - Math.round(quantity)) > 0.01
}

/**
 * Ingredient with its unit price and the relative quantity for one batch.
 */
export type IngredientCost = {
  quantity: number
  priceCents: number
}

/**
 * Compute the optimistic + pessimistic band for a group: primary row + 0..N
 * alternative rows. The optimistic band picks the cheapest substitution per
 * group; the pessimistic band picks the priciest. Single-option groups collapse
 * (lowCents === highCents).
 */
export function groupCostBand(group: IngredientCost[]): {
  lowCents: number
  highCents: number
  hasRange: boolean
} {
  if (group.length === 0) {
    return { lowCents: 0, highCents: 0, hasRange: false }
  }
  let lowCents = Number.POSITIVE_INFINITY
  let highCents = 0
  for (const ing of group) {
    const cost = Math.round(ing.priceCents * ing.quantity)
    if (cost < lowCents) lowCents = cost
    if (cost > highCents) highCents = cost
  }
  if (!Number.isFinite(lowCents)) lowCents = 0
  return {
    lowCents,
    highCents,
    hasRange: group.length > 1 && lowCents !== highCents,
  }
}

/** Returns the cheaper primary row from a group (lowest qty×price). */
export function cheapestIngredient(group: IngredientCost[]) {
  if (group.length === 0) return null
  return group.reduce((best, ing) => {
    const cost = Math.round(ing.priceCents * ing.quantity)
    const bestCost = Math.round(best.priceCents * best.quantity)
    return cost < bestCost ? ing : best
  })
}
