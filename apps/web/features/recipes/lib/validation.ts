import { z } from "zod"

export const recipeInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
  yieldMl: z.number().int().positive().max(1000000),
  items: z
    .array(
      z.object({
        itemId: z.number().int().positive(),
        quantity: z.number().positive().max(100000),
      })
    )
    .min(1),
})

export type RecipeInput = z.infer<typeof recipeInputSchema>
