export const ITEM_TYPES = ["base", "drink", "fruit", "accessory", "other"] as const

export type ItemType = (typeof ITEM_TYPES)[number]

export const itemTypeDot: Record<ItemType, string> = {
  base: "bg-violet-500",
  drink: "bg-sky-500",
  fruit: "bg-lime-500",
  accessory: "bg-amber-500",
  other: "bg-muted-foreground/40",
}
