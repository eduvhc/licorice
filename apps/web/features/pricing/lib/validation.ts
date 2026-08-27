import { z } from "zod"

import { TAG_COLORS } from "@/features/settings/lib/tag-colors"

export const retailerInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: z.enum(TAG_COLORS),
  url: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(300).optional().default(""),
})

export const priceOfferInputSchema = z.object({
  retailerId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive().max(1000000),
  unitId: z.number().int().positive(),
  priceCents: z.number().int().min(0).max(100000000),
  validOn: z.string().trim().optional(),
  url: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(300).optional().default(""),
})

export type RetailerInput = z.infer<typeof retailerInputSchema>
export type PriceOfferInput = z.infer<typeof priceOfferInputSchema>
