import { z } from "zod"

export const itemInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  priceCents: z.number().int().min(0),
  tagId: z.number().int().positive(),
  unitId: z.number().int().positive(),
})

export type ItemInput = z.infer<typeof itemInputSchema>
