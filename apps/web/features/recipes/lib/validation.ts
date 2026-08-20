import { z } from "zod"

export const ingredientInputSchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().positive().max(100000),
})

export const ingredientGroupInputSchema = z.object({
  primary: ingredientInputSchema,
  alternatives: z.array(ingredientInputSchema).default([]),
})

export const recipeInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
  yieldMl: z.number().int().positive().max(1000000),
  groups: z.array(ingredientGroupInputSchema).min(1),
})

export type IngredientInput = z.infer<typeof ingredientInputSchema>
export type IngredientGroupInput = z.infer<typeof ingredientGroupInputSchema>
export type RecipeInput = z.infer<typeof recipeInputSchema>
