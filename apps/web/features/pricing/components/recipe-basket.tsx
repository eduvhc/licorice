"use client"

import { useFormatter, useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"
import { StoreIcon } from "lucide-react"

import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"

import type { RetailerBasketWithMeta } from "../server/queries"

export function RecipeBasket({
  baskets,
}: {
  baskets: RetailerBasketWithMeta[]
}) {
  const t = useTranslations("pricing")
  const format = useFormatter()

  function money(cents: number) {
    return format.number(cents / 100, { style: "currency", currency: "EUR" })
  }

  if (baskets.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <StoreIcon className="size-4 text-muted-foreground" />
          {t("baskets.title")}
        </div>
        <p className="text-sm text-muted-foreground">{t("baskets.empty")}</p>
      </div>
    )
  }

  const cheapest = baskets[0]!

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <StoreIcon className="size-4 text-muted-foreground" />
        {t("baskets.title")}
      </div>
      <div className="space-y-1.5">
        {baskets.map((basket) => {
          const isCheapest = basket.retailerId === cheapest.retailerId
          return (
            <div
              key={basket.retailerId}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2",
                isCheapest ? "border-primary/40 bg-primary/5" : "border-border"
              )}
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  isTagColor(basket.retailerColor)
                    ? tagColorDot[basket.retailerColor]
                    : "bg-zinc-500"
                )}
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {basket.retailerName}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {money(basket.totalLowCents)}
              </span>
              {basket.hasRange ? (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  –{money(basket.totalHighCents)}
                </span>
              ) : null}
              {basket.coverage < 1 ? (
                <span
                  className="shrink-0 text-xs text-muted-foreground"
                  title={t("baskets.partialHint")}
                >
                  {t("baskets.partial", {
                    percent: Math.round(basket.coverage * 100),
                  })}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
