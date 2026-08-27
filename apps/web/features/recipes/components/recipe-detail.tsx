"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  CheckIcon,
  PencilIcon,
  TriangleAlertIcon,
  Trash2Icon,
} from "lucide-react"

import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import type { Bottle } from "@/features/settings/server/queries"
import { Link, useRouter } from "@/i18n/navigation"
import { cn } from "@workspace/ui/lib/utils"

import {
  costForVolume,
  MAX_BATCH_ML,
  MAX_MARGIN_PERCENT,
  MIN_BATCH_ML,
  MIN_MARGIN_PERCENT,
  needsWholeUnitWarning,
  DEFAULT_MARGIN_PERCENT,
} from "../lib/pricing"
import { deleteRecipeAction } from "../server/actions"
import type {
  RecipeIngredient,
  RecipeIngredientGroup,
  RecipeWithItems,
} from "../server/queries"

function money(format: ReturnType<typeof useFormatter>, cents: number) {
  return format.number(cents / 100, { style: "currency", currency: "EUR" })
}

/** -1 selects the primary row; N selects `alternatives[N]`. */
type Choice = number

function resolveChoice(
  group: RecipeIngredientGroup,
  choice: Choice
): RecipeIngredient {
  return choice === -1
    ? group.primary
    : (group.alternatives[choice] ?? group.primary)
}

function TagDot({ tagColor }: { tagColor: RecipeIngredient["tagColor"] }) {
  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        isTagColor(tagColor) ? tagColorDot[tagColor] : "bg-zinc-500"
      )}
    />
  )
}

function WasteWarning({
  ingredient,
  scaledQuantity,
  t,
}: {
  ingredient: RecipeIngredient
  scaledQuantity: number
  t: ReturnType<typeof useTranslations<"recipes">>
}) {
  const format = useFormatter()
  if (!needsWholeUnitWarning(ingredient.unitName, scaledQuantity)) return null

  return (
    <span className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
      <TriangleAlertIcon className="size-3 shrink-0" />
      {t("breakdown.wasteWarning", {
        quantity: format.number(scaledQuantity, { maximumFractionDigits: 2 }),
        unit: ingredient.unitName,
        rounded: Math.ceil(scaledQuantity),
      })}
    </span>
  )
}

/** Dense selectable row, used inside the expanded alternatives list. */
function OptionButton({
  ingredient,
  selected,
  isDefault,
  format,
  scale,
  onSelect,
  t,
}: {
  ingredient: RecipeIngredient
  selected: boolean
  isDefault: boolean
  format: ReturnType<typeof useFormatter>
  scale: number
  onSelect: () => void
  t: ReturnType<typeof useTranslations<"recipes">>
}) {
  const scaledQuantity = ingredient.quantity * scale
  const costCents = Math.round(ingredient.priceCents * scaledQuantity)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
        selected
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border"
        )}
      >
        {selected ? <CheckIcon className="size-2.5" /> : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <TagDot tagColor={ingredient.tagColor} />
          <span className="truncate text-sm">{ingredient.name}</span>
          {isDefault ? (
            <span className="shrink-0 text-[0.6rem] tracking-wider text-muted-foreground uppercase">
              {t("detail.default")}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {format.number(scaledQuantity, { maximumFractionDigits: 2 })}{" "}
          {ingredient.unitName} × {money(format, ingredient.priceCents)}
        </span>
      </span>

      <span className="shrink-0 text-sm font-medium tabular-nums">
        {money(format, costCents)}
      </span>
    </button>
  )
}

function IngredientGroupPanel({
  group,
  choice,
  onChoose,
  format,
  scale,
  t,
}: {
  group: RecipeIngredientGroup
  choice: Choice
  onChoose: (choice: Choice) => void
  format: ReturnType<typeof useFormatter>
  scale: number
  t: ReturnType<typeof useTranslations<"recipes">>
}) {
  const hasAlternatives = group.alternatives.length > 0
  const [expanded, setExpanded] = React.useState(false)

  const selected = resolveChoice(group, choice)
  const scaledQuantity = selected.quantity * scale
  const costCents = Math.round(selected.priceCents * scaledQuantity)

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => hasAlternatives && setExpanded((current) => !current)}
        aria-expanded={hasAlternatives ? expanded : undefined}
        aria-label={
          hasAlternatives
            ? t("detail.alternativesToggle", {
                count: group.alternatives.length,
              })
            : undefined
        }
        className={cn(
          "flex w-full items-center gap-3 p-3 text-left",
          !hasAlternatives && "cursor-default"
        )}
      >
        <TagDot tagColor={selected.tagColor} />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {selected.name}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {format.number(scaledQuantity, { maximumFractionDigits: 2 })}{" "}
            {selected.unitName} × {money(format, selected.priceCents)}
          </span>
          <WasteWarning
            ingredient={selected}
            scaledQuantity={scaledQuantity}
            t={t}
          />
        </span>

        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {money(format, costCents)}
        </span>

        {hasAlternatives ? (
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        ) : null}
      </button>

      {hasAlternatives && expanded ? (
        <div className="space-y-1.5 border-t px-3 pt-3 pb-3">
          <OptionButton
            ingredient={group.primary}
            selected={choice === -1}
            isDefault
            format={format}
            scale={scale}
            onSelect={() => onChoose(-1)}
            t={t}
          />
          {group.alternatives.map((alt, altIndex) => (
            <OptionButton
              key={alt.itemId}
              ingredient={alt}
              selected={choice === altIndex}
              isDefault={false}
              format={format}
              scale={scale}
              onSelect={() => onChoose(altIndex)}
              t={t}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function BottlePriceCard({
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

function RecipeDetail({
  recipe,
  bottles,
  pricingSlot,
}: {
  recipe: RecipeWithItems
  bottles: Bottle[]
  /** Cost-by-shop panel, injected by the route so this slice stays pricing-agnostic. */
  pricingSlot?: React.ReactNode
}) {
  const t = useTranslations("recipes")
  const format = useFormatter()
  const router = useRouter()

  const [choices, setChoices] = React.useState<Choice[]>(() =>
    recipe.groups.map(() => -1)
  )
  const [marginPercent, setMarginPercent] = React.useState(
    DEFAULT_MARGIN_PERCENT
  )
  const [batchMl, setBatchMl] = React.useState<number | null>(null)
  const [batchText, setBatchText] = React.useState("")
  const [deleting, startDeleteTransition] = React.useTransition()

  const clampedMargin = Math.min(
    MAX_MARGIN_PERCENT,
    Math.max(MIN_MARGIN_PERCENT, marginPercent)
  )
  const effectiveYieldMl = batchMl && batchMl > 0 ? batchMl : recipe.yieldMl
  const scale = effectiveYieldMl / recipe.yieldMl

  const selectedTotalCents = recipe.groups.reduce((sum, group, index) => {
    const ingredient = resolveChoice(group, choices[index] ?? -1)
    return sum + Math.round(ingredient.priceCents * ingredient.quantity * scale)
  }, 0)
  const costPerMl =
    effectiveYieldMl > 0 ? selectedTotalCents / effectiveYieldMl : 0

  function handleBatchChange(raw: string) {
    setBatchText(raw)
    if (raw.trim() === "") {
      setBatchMl(null)
      return
    }
    const value = Math.round(Number(raw))
    if (
      Number.isFinite(value) &&
      value >= MIN_BATCH_ML &&
      value <= MAX_BATCH_ML
    ) {
      setBatchMl(value)
    }
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteRecipeAction(recipe.id)
      if (!result.ok) {
        toast.error(t(`errors.${result.error}`))
        return
      }
      toast.success(t("toast.deleted"))
      router.push("/dashboard/recipes")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="space-y-3">
        <Link
          href="/dashboard/recipes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t("detail.back")}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {recipe.name}
            </h1>
            {recipe.description ? (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {recipe.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/dashboard/recipes/${recipe.id}/edit`} />}
            >
              <PencilIcon data-icon="inline-start" />
              {t("editRecipe")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2Icon data-icon="inline-start" />
              {t("deleteRecipe")}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-3">
          {recipe.groups.map((group, index) => (
            <IngredientGroupPanel
              key={group.primary.itemId}
              group={group}
              choice={choices[index] ?? -1}
              onChoose={(choice) =>
                setChoices((current) => {
                  const next = [...current]
                  next[index] = choice
                  return next
                })
              }
              format={format}
              scale={scale}
              t={t}
            />
          ))}

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3 text-sm font-medium">
            <span>
              {t("breakdown.cost")} ·{" "}
              {t("breakdown.yield", { ml: effectiveYieldMl })}
            </span>
            <span className="tabular-nums">
              {money(format, selectedTotalCents)}
            </span>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-xl border bg-card p-4">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="detail-batch">
                  {t("breakdown.batchPlanner")}
                </FieldLabel>
                {batchMl !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setBatchMl(null)
                      setBatchText("")
                    }}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {t("breakdown.resetBatch")}
                  </button>
                ) : null}
              </div>
              <div className="relative">
                <Input
                  id="detail-batch"
                  type="number"
                  inputMode="numeric"
                  min={MIN_BATCH_ML}
                  max={MAX_BATCH_ML}
                  placeholder={String(recipe.yieldMl)}
                  value={batchText}
                  onChange={(event) => handleBatchChange(event.target.value)}
                  className="pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                  ml
                </span>
              </div>
            </Field>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <Field>
              <FieldLabel htmlFor="detail-margin">
                {t("breakdown.targetMargin")}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="detail-margin"
                  type="number"
                  inputMode="decimal"
                  min={MIN_MARGIN_PERCENT}
                  max={MAX_MARGIN_PERCENT}
                  value={marginPercent}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    if (!Number.isNaN(value)) setMarginPercent(value)
                  }}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </Field>
          </div>

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
              <div className="space-y-2">
                {bottles.map((bottle) => (
                  <BottlePriceCard
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

          {pricingSlot}
        </div>
      </div>
    </div>
  )
}

export { RecipeDetail }
