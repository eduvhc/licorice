"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { TriangleAlertIcon } from "lucide-react"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"

import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import type { Bottle } from "@/features/settings/server/queries"
import { Link } from "@/i18n/navigation"

import {
  costForVolume,
  MAX_BATCH_ML,
  MAX_MARGIN_PERCENT,
  MIN_BATCH_ML,
  MIN_MARGIN_PERCENT,
  needsWholeUnitWarning,
} from "../lib/pricing"
import type { RecipeWithItems } from "../server/queries"

function money(format: ReturnType<typeof useFormatter>, cents: number) {
  return format.number(cents / 100, { style: "currency", currency: "EUR" })
}

function BatchPlanner({
  recipe,
  batchMl,
  onBatchMlChange,
}: {
  recipe: RecipeWithItems
  batchMl: number | null
  onBatchMlChange: (value: number | null) => void
}) {
  const t = useTranslations("recipes")
  const [text, setText] = React.useState(
    batchMl !== null ? String(batchMl) : ""
  )
  const [synced, setSynced] = React.useState(batchMl)

  if (batchMl !== synced) {
    setSynced(batchMl)
    setText(batchMl !== null ? String(batchMl) : "")
  }

  function handleChange(raw: string) {
    setText(raw)

    if (raw.trim() === "") {
      onBatchMlChange(null)
      return
    }

    const value = Math.round(Number(raw))
    if (
      Number.isFinite(value) &&
      value >= MIN_BATCH_ML &&
      value <= MAX_BATCH_ML
    ) {
      onBatchMlChange(value)
    }
  }

  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={`batch-${recipe.id}`}>
          {t("breakdown.batchPlanner")}
        </FieldLabel>
        {batchMl !== null ? (
          <button
            type="button"
            onClick={() => onBatchMlChange(null)}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("breakdown.resetBatch")}
          </button>
        ) : null}
      </div>
      <div className="relative">
        <Input
          id={`batch-${recipe.id}`}
          type="number"
          inputMode="numeric"
          min={MIN_BATCH_ML}
          max={MAX_BATCH_ML}
          placeholder={String(recipe.yieldMl)}
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          className="pr-10"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          ml
        </span>
      </div>
    </Field>
  )
}

function IngredientRow({
  item,
  format,
  scale,
}: {
  item: RecipeWithItems["items"][number]
  format: ReturnType<typeof useFormatter>
  scale: number
}) {
  const t = useTranslations("recipes")
  const scaledQuantity = item.quantity * scale
  const warn = needsWholeUnitWarning(item.unitName, scaledQuantity)

  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              isTagColor(item.tagColor)
                ? tagColorDot[item.tagColor]
                : "bg-zinc-500"
            )}
          />
          <span className="truncate font-medium">{item.name}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {format.number(scaledQuantity, { maximumFractionDigits: 2 })}{" "}
          {item.unitName} × {money(format, item.priceCents)}
        </div>
        {warn ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
            <TriangleAlertIcon className="size-3 shrink-0" />
            {t("breakdown.wasteWarning", {
              quantity: format.number(scaledQuantity, {
                maximumFractionDigits: 2,
              }),
              unit: item.unitName,
              rounded: Math.ceil(scaledQuantity),
            })}
          </div>
        ) : null}
      </div>
      <span className="shrink-0 font-medium tabular-nums">
        {money(format, item.priceCents * scaledQuantity)}
      </span>
    </div>
  )
}

function BottleCard({
  bottle,
  costPerMl,
  clampedMargin,
  format,
}: {
  bottle: Bottle
  costPerMl: number
  clampedMargin: number
  format: ReturnType<typeof useFormatter>
}) {
  const t = useTranslations("recipes")
  const liquidCostCents = costForVolume(costPerMl, bottle.sizeMl)
  const costCents = liquidCostCents + bottle.priceCents
  const suggestedPriceCents = Math.round(costCents / (1 - clampedMargin / 100))
  const profitCents = suggestedPriceCents - costCents

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{bottle.name}</div>
          <div className="text-xs text-muted-foreground">
            {bottle.sizeMl} ml · {money(format, bottle.priceCents)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">
            {t("breakdown.suggestedPrice")}
          </div>
          <div className="text-base font-semibold tabular-nums">
            {money(format, suggestedPriceCents)}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
          <div className="text-xs text-muted-foreground">
            {t("breakdown.cost")}
          </div>
          <div className="text-sm font-medium tabular-nums">
            {money(format, costCents)}
          </div>
        </div>
        <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
          <div className="text-xs text-muted-foreground">
            {t("breakdown.profit")}
          </div>
          <div className="text-sm font-medium tabular-nums">
            {money(format, profitCents)}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecipeCostBreakdown({
  recipe,
  marginPercent,
  onMarginPercentChange,
  bottles,
  batchMl,
  onBatchMlChange,
}: {
  recipe: RecipeWithItems
  marginPercent: number
  onMarginPercentChange: (value: number) => void
  bottles: Bottle[]
  batchMl: number | null
  onBatchMlChange: (value: number | null) => void
}) {
  const t = useTranslations("recipes")
  const format = useFormatter()

  const clampedMargin = Math.min(
    MAX_MARGIN_PERCENT,
    Math.max(MIN_MARGIN_PERCENT, marginPercent)
  )
  const costPerMl = recipe.yieldMl > 0 ? recipe.totalCents / recipe.yieldMl : 0
  const effectiveYieldMl = batchMl && batchMl > 0 ? batchMl : recipe.yieldMl
  const scale = effectiveYieldMl / recipe.yieldMl
  const batchCostCents = costForVolume(costPerMl, effectiveYieldMl)

  return (
    <div className="space-y-4 py-4">
      <div className="max-w-xs">
        <BatchPlanner
          recipe={recipe}
          batchMl={batchMl}
          onBatchMlChange={onBatchMlChange}
        />
      </div>

      <Tabs defaultValue="ingredients" className="max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingredients">
            {t("breakdown.ingredients")}
          </TabsTrigger>
          <TabsTrigger value="pricing">{t("breakdown.simulation")}</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-2">
          <div className="divide-y rounded-md border">
            {recipe.items.map((item) => (
              <IngredientRow
                key={item.itemId}
                item={item}
                format={format}
                scale={scale}
              />
            ))}
            <div className="flex items-center justify-between px-3 py-2.5 text-sm font-medium">
              <span>
                {t("breakdown.cost")} ·{" "}
                {t("breakdown.yield", { ml: effectiveYieldMl })}
              </span>
              <span className="tabular-nums">
                {money(format, batchCostCents)}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Field>
            <FieldLabel htmlFor={`margin-${recipe.id}`}>
              {t("breakdown.targetMargin")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`margin-${recipe.id}`}
                type="number"
                inputMode="decimal"
                min={MIN_MARGIN_PERCENT}
                max={MAX_MARGIN_PERCENT}
                value={marginPercent}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (!Number.isNaN(value)) {
                    onMarginPercentChange(value)
                  }
                }}
                className="pr-8"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                %
              </span>
            </div>
          </Field>

          <div className="space-y-2">
            <FieldLabel>{t("breakdown.bottles")}</FieldLabel>

            {bottles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("breakdown.noBottles")}{" "}
                <Link
                  href="/dashboard/settings?tab=bottles"
                  className="underline"
                >
                  {t("breakdown.noBottlesLink")}
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bottles.map((bottle) => (
                  <BottleCard
                    key={bottle.id}
                    bottle={bottle}
                    costPerMl={costPerMl}
                    clampedMargin={clampedMargin}
                    format={format}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { RecipeCostBreakdown }
