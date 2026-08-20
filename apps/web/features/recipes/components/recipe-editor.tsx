"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import {
  ArrowLeftIcon,
  CirclePlusIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import type { Item } from "@/features/inventory/server/queries"
import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import { Link, useRouter } from "@/i18n/navigation"
import { cn } from "@workspace/ui/lib/utils"

import { DEFAULT_YIELD_ML } from "../lib/pricing"
import type { IngredientGroupInput } from "../lib/validation"
import { saveRecipeAction } from "../server/actions"
import type { RecipeWithItems } from "../server/queries"

type GroupRow = {
  key: string
  altKeys: string[]
  primary: { itemId: number; quantity: string }
  alternatives: { itemId: number; quantity: string }[]
}

function toGroups(recipe?: RecipeWithItems): GroupRow[] {
  if (recipe) {
    return recipe.groups.map((group, index) => ({
      key: `group-${index}`,
      altKeys: group.alternatives.map(
        (_, altIndex) => `row-${index}-alt-${altIndex}`
      ),
      primary: {
        itemId: group.primary.itemId,
        quantity: String(group.primary.quantity),
      },
      alternatives: group.alternatives.map((alt) => ({
        itemId: alt.itemId,
        quantity: String(alt.quantity),
      })),
    }))
  }

  return [
    {
      key: "group-0",
      altKeys: [],
      primary: { itemId: 0, quantity: "1" },
      alternatives: [],
    },
  ]
}

function parseQuantity(value: string) {
  return Number.parseFloat(value.replace(",", "."))
}

function ItemQuantityRow({
  selectedId,
  onSelectedIdChange,
  quantity,
  onQuantityChange,
  items,
  variant,
  onRemove,
  t,
}: {
  selectedId: number
  onSelectedIdChange: (id: number) => void
  quantity: string
  onQuantityChange: (value: string) => void
  items: Item[]
  variant: "primary" | "alternative"
  onRemove?: () => void
  t: ReturnType<typeof useTranslations<"recipes">>
}) {
  const selected = items.find((item) => item.id === selectedId)

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md border border-foreground/5 bg-background/60 p-2 sm:flex sm:flex-nowrap sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0">
      <Select
        value={selectedId ? String(selectedId) : ""}
        onValueChange={(value) => onSelectedIdChange(Number(value))}
        items={items.map((option) => ({
          label: option.name,
          value: String(option.id),
        }))}
      >
        <SelectTrigger
          size="sm"
          className="col-span-3 w-full sm:w-64 sm:flex-1"
        >
          <SelectValue
            placeholder={
              variant === "alternative"
                ? t("form.selectAlternative")
                : t("fields.selectItem")
            }
          />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isTagColor(option.tag.color)
                      ? tagColorDot[option.tag.color]
                      : "bg-zinc-500"
                  )}
                />
                {option.name}
                <span className="text-muted-foreground">
                  /{option.unit.name}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="col-span-2 flex items-center gap-1 sm:w-28">
        <Input
          className="w-full sm:w-20"
          inputMode="decimal"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          aria-label={t("fields.quantity")}
          placeholder="1"
        />
        {selected ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {selected.unit.name}
          </span>
        ) : null}
      </div>

      <div className="col-span-1 flex items-center justify-end">
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={onRemove}
            aria-label={t("fields.remove")}
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function IngredientGroupCard({
  group,
  groupIndex,
  items,
  onRemoveGroup,
  onUpdatePrimary,
  onAddAlternative,
  onUpdateAlternative,
  onRemoveAlternative,
  removable,
  t,
}: {
  group: GroupRow
  groupIndex: number
  items: Item[]
  onRemoveGroup: () => void
  onUpdatePrimary: (patch: Partial<GroupRow["primary"]>) => void
  onAddAlternative: () => void
  onUpdateAlternative: (
    altIndex: number,
    patch: Partial<GroupRow["alternatives"][number]>
  ) => void
  onRemoveAlternative: (altIndex: number) => void
  removable: boolean
  t: ReturnType<typeof useTranslations<"recipes">>
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="outline" className="gap-1.5 text-xs">
          {t("form.ingredientGroup")} #{groupIndex + 1}
        </Badge>
        {removable ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={onRemoveGroup}
            aria-label={t("form.removeGroup")}
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <ItemQuantityRow
          selectedId={group.primary.itemId}
          onSelectedIdChange={(id) => onUpdatePrimary({ itemId: id })}
          quantity={group.primary.quantity}
          onQuantityChange={(value) => onUpdatePrimary({ quantity: value })}
          items={items}
          variant="primary"
          t={t}
        />

        {group.alternatives.length > 0 ? (
          <div className="ml-4 space-y-2 border-l-2 border-dashed border-border pl-3">
            {group.alternatives.map((alt, altIndex) => (
              <ItemQuantityRow
                key={group.altKeys[altIndex]}
                selectedId={alt.itemId}
                onSelectedIdChange={(id) =>
                  onUpdateAlternative(altIndex, { itemId: id })
                }
                quantity={alt.quantity}
                onQuantityChange={(value) =>
                  onUpdateAlternative(altIndex, { quantity: value })
                }
                items={items}
                variant="alternative"
                onRemove={() => onRemoveAlternative(altIndex)}
                t={t}
              />
            ))}
          </div>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddAlternative}
          className="text-muted-foreground"
        >
          <PlusIcon data-icon="inline-start" />
          {t("form.addAlternative")}
        </Button>
      </div>
    </div>
  )
}

function RecipeEditor({
  items,
  recipe,
}: {
  items: Item[]
  recipe?: RecipeWithItems
}) {
  const t = useTranslations("recipes")
  const format = useFormatter()
  const router = useRouter()
  const [groups, setGroups] = React.useState<GroupRow[]>(() => toGroups(recipe))
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  const itemsById = new Map(items.map((item) => [item.id, item]))

  const totalPreviewCents = groups.reduce((sum, group) => {
    const primary = itemsById.get(group.primary.itemId)
    if (!primary) return sum
    const quantity = parseQuantity(group.primary.quantity)
    if (Number.isNaN(quantity) || quantity <= 0) return sum
    return sum + primary.price_cents * quantity
  }, 0)

  function addGroup() {
    setGroups((current) => [
      ...current,
      {
        key: `group-${current.length}-${Date.now()}`,
        altKeys: [],
        primary: { itemId: 0, quantity: "1" },
        alternatives: [],
      },
    ])
  }

  function removeGroup(key: string) {
    setGroups((current) => current.filter((group) => group.key !== key))
  }

  function updatePrimary(
    groupKey: string,
    patch: Partial<GroupRow["primary"]>
  ) {
    setGroups((current) =>
      current.map((group) =>
        group.key === groupKey
          ? { ...group, primary: { ...group.primary, ...patch } }
          : group
      )
    )
  }

  function addAlternative(groupKey: string) {
    setGroups((current) =>
      current.map((group) => {
        if (group.key !== groupKey) return group
        const newKey = `row-${groupKey}-alt-${group.altKeys.length}-${Date.now()}`
        return {
          ...group,
          altKeys: [...group.altKeys, newKey],
          alternatives: [...group.alternatives, { itemId: 0, quantity: "1" }],
        }
      })
    )
  }

  function updateAlternative(
    groupKey: string,
    altIndex: number,
    patch: Partial<GroupRow["alternatives"][number]>
  ) {
    setGroups((current) =>
      current.map((group) => {
        if (group.key !== groupKey) return group
        return {
          ...group,
          alternatives: group.alternatives.map((alt, i) =>
            i === altIndex ? { ...alt, ...patch } : alt
          ),
        }
      })
    )
  }

  function removeAlternative(groupKey: string, altIndex: number) {
    setGroups((current) =>
      current.map((group) => {
        if (group.key !== groupKey) return group
        return {
          ...group,
          altKeys: group.altKeys.filter((_, i) => i !== altIndex),
          alternatives: group.alternatives.filter((_, i) => i !== altIndex),
        }
      })
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "")
    const description = String(formData.get("description") ?? "")
    const yieldMl = Number(formData.get("yieldMl") ?? DEFAULT_YIELD_ML)

    const normalisedGroups: IngredientGroupInput[] = []

    for (const group of groups) {
      const primaryQuantity = parseQuantity(group.primary.quantity)
      if (
        group.primary.itemId <= 0 ||
        Number.isNaN(primaryQuantity) ||
        primaryQuantity <= 0
      ) {
        continue
      }
      const alternatives = group.alternatives.flatMap((alt) => {
        const quantity = parseQuantity(alt.quantity)
        if (alt.itemId > 0 && !Number.isNaN(quantity) && quantity > 0) {
          return [{ itemId: alt.itemId, quantity }]
        }
        return []
      })
      normalisedGroups.push({
        primary: { itemId: group.primary.itemId, quantity: primaryQuantity },
        alternatives,
      })
    }

    if (
      !name.trim() ||
      normalisedGroups.length === 0 ||
      Number.isNaN(yieldMl) ||
      yieldMl <= 0
    ) {
      setError(
        normalisedGroups.length === 0
          ? t("errors.noItems")
          : t("errors.invalid")
      )
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await saveRecipeAction(
        { name, description, yieldMl, groups: normalisedGroups },
        recipe?.id
      )

      if (!result.ok) {
        setError(t(`errors.${result.error}`))
        return
      }

      toast.success(t("toast.saved"))
      router.push(
        recipe ? `/dashboard/recipes/${recipe.id}` : "/dashboard/recipes"
      )
      router.refresh()
    })
  }

  const backHref = recipe
    ? `/dashboard/recipes/${recipe.id}`
    : "/dashboard/recipes"

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <p className="text-sm text-muted-foreground">{t("errors.noItems")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="space-y-1">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t(recipe ? "editRecipe" : "newRecipe")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t(recipe ? "editRecipe" : "newRecipe")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field>
              <FieldLabel htmlFor="recipe-name">{t("fields.name")}</FieldLabel>
              <Input
                id="recipe-name"
                name="name"
                placeholder={t("fields.namePlaceholder")}
                defaultValue={recipe?.name}
                required
                maxLength={120}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="recipe-description">
                {t("fields.description")}
              </FieldLabel>
              <Input
                id="recipe-description"
                name="description"
                placeholder={t("fields.descriptionPlaceholder")}
                defaultValue={recipe?.description}
                maxLength={500}
              />
            </Field>
            <Field className="sm:w-32">
              <FieldLabel htmlFor="recipe-yield">
                {t("fields.yieldMl")}
              </FieldLabel>
              <Input
                id="recipe-yield"
                name="yieldMl"
                type="number"
                inputMode="numeric"
                min={1}
                defaultValue={recipe?.yieldMl ?? DEFAULT_YIELD_ML}
                required
              />
            </Field>
          </div>
        </FieldGroup>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel>{t("fields.items")}</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGroup}
            >
              <CirclePlusIcon data-icon="inline-start" />
              {t("fields.addItem")}
            </Button>
          </div>

          <div className="space-y-3">
            {groups.map((group, groupIndex) => (
              <IngredientGroupCard
                key={group.key}
                group={group}
                groupIndex={groupIndex}
                items={items}
                removable={groups.length > 1}
                onRemoveGroup={() => removeGroup(group.key)}
                onUpdatePrimary={(patch) => updatePrimary(group.key, patch)}
                onAddAlternative={() => addAlternative(group.key)}
                onUpdateAlternative={(altIndex, patch) =>
                  updateAlternative(group.key, altIndex, patch)
                }
                onRemoveAlternative={(altIndex) =>
                  removeAlternative(group.key, altIndex)
                }
                t={t}
              />
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {totalPreviewCents > 0 ? (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("fields.total")}
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {format.number(totalPreviewCents / 100, {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          </>
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>
            {t(recipe ? "editRecipe" : "newRecipe")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            render={<Link href={backHref} />}
          >
            {t("form.cancel")}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { RecipeEditor }
