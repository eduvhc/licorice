import { z } from "zod"

import { TAG_COLORS } from "./tag-colors"

export const tagInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: z.enum(TAG_COLORS),
})

export const unitInputSchema = z.object({
  name: z.string().trim().min(1).max(16),
})

export const bottleInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  sizeMl: z.number().int().positive().max(100000),
  priceCents: z.number().int().min(0).max(10000000),
})

export type TagInput = z.infer<typeof tagInputSchema>
export type UnitInput = z.infer<typeof unitInputSchema>
export type BottleInput = z.infer<typeof bottleInputSchema>
