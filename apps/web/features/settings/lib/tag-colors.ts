export const TAG_COLORS = [
  "violet",
  "sky",
  "lime",
  "amber",
  "rose",
  "emerald",
  "orange",
  "zinc",
] as const

export type TagColor = (typeof TAG_COLORS)[number]

export const tagColorDot: Record<TagColor, string> = {
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  lime: "bg-lime-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  zinc: "bg-zinc-500",
}

export function isTagColor(value: string): value is TagColor {
  return (TAG_COLORS as readonly string[]).includes(value)
}
