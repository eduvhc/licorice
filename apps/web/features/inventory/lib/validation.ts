import { z } from "zod"

import { ITEM_TYPES } from "./item-types"

export const itemInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  unit: z.string().trim().min(1).max(16),
  priceCents: z.number().int().min(0),
  type: z.enum(ITEM_TYPES),
})

export type ItemInput = z.infer<typeof itemInputSchema>
