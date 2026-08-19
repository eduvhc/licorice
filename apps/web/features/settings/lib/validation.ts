import { z } from "zod"

import { TAG_COLORS } from "./tag-colors"

export const tagInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: z.enum(TAG_COLORS),
})

export const unitInputSchema = z.object({
  name: z.string().trim().min(1).max(16),
})

export type TagInput = z.infer<typeof tagInputSchema>
export type UnitInput = z.infer<typeof unitInputSchema>
