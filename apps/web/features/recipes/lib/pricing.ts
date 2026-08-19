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
