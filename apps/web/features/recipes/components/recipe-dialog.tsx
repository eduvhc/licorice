"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import type { Item } from "@/features/inventory/server/queries"
import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import { cn } from "@workspace/ui/lib/utils"

import { saveRecipeAction } from "../server/actions"
import type { RecipeWithItems } from "../server/queries"

type IngredientRow = {
  key: string
  itemId: number | null
  quantity: string
}

function toRows(recipe?: RecipeWithItems): IngredientRow[] {
  if (recipe) {
    return recipe.items.map((item, index) => ({
      key: `row-${index}`,
      itemId: item.itemId,
      quantity: String(item.quantity),
    }))
  }

  return [{ key: "row-0", itemId: null, quantity: "1" }]
}

function parseQuantity(value: string) {
  return Number.parseFloat(value.replace(",", "."))
}

function RecipeForm({
  items,
  recipe,
  onDone,
}: {
  items: Item[]
  recipe?: RecipeWithItems
  onDone: () => void
}) {
  const t = useTranslations("recipes")
  const format = useFormatter()
  const router = useRouter()
  const [rows, setRows] = React.useState<IngredientRow[]>(() => toRows(recipe))
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  const itemsById = new Map(items.map((item) => [item.id, item]))
  const totalCents = rows.reduce((sum, row) => {
    const item = row.itemId ? itemsById.get(row.itemId) : undefined
    const quantity = parseQuantity(row.quantity)

    if (!item || Number.isNaN(quantity) || quantity <= 0) {
      return sum
    }

    return sum + item.price_cents * quantity
  }, 0)

  function addRow() {
    setRows((current) => [
      ...current,
      { key: `row-${current.length}-${Date.now()}`, itemId: null, quantity: "1" },
    ])
  }

  function removeRow(key: string) {
    setRows((current) => {
      const next = current.filter((row) => row.key !== key)
      return next.length > 0 ? next : [{ key: "row-0", itemId: null, quantity: "1" }]
    })
  }

  function updateRow(key: string, patch: Partial<IngredientRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "")
    const description = String(formData.get("description") ?? "")

    const ingredients: { itemId: number; quantity: number }[] = []
    for (const row of rows) {
      const quantity = parseQuantity(row.quantity)

      if (row.itemId === null || Number.isNaN(quantity) || quantity <= 0) {
        continue
      }

      ingredients.push({ itemId: row.itemId, quantity })
    }

    if (!name.trim() || ingredients.length === 0) {
      setError(ingredients.length === 0 ? t("errors.noItems") : t("errors.invalid"))
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await saveRecipeAction(
        { name, description, items: ingredients },
        recipe?.id
      )

      if (!result.ok) {
        setError(t(`errors.${result.error}`))
        return
      }

      toast.success(t("toast.saved"))
      onDone()
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("errors.noItems")}</p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
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
          <FieldLabel htmlFor="recipe-description">{t("fields.description")}</FieldLabel>
          <Input
            id="recipe-description"
            name="description"
            placeholder={t("fields.descriptionPlaceholder")}
            defaultValue={recipe?.description}
            maxLength={500}
          />
        </Field>

        <div className="space-y-3">
          <FieldLabel>{t("fields.items")}</FieldLabel>
          <div className="space-y-2">
            {rows.map((row) => {
              const item = row.itemId ? itemsById.get(row.itemId) : undefined

              return (
                <div key={row.key} className="flex items-center gap-2">
                  <Select
                    value={row.itemId === null ? "" : String(row.itemId)}
                    onValueChange={(value) => {
                      updateRow(row.key, { itemId: value === "" ? null : Number(value) })
                    }}
                    items={items.map((option) => ({
                      label: option.name,
                      value: String(option.id),
                    }))}
                  >
                    <SelectTrigger className="flex-1" size="sm">
                      <SelectValue placeholder={t("fields.selectItem")} />
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
                  <div className="flex w-28 items-center gap-1">
                    <Input
                      className="w-full"
                      inputMode="decimal"
                      value={row.quantity}
                      onChange={(event) =>
                        updateRow(row.key, { quantity: event.target.value })
                      }
                      aria-label={t("fields.quantity")}
                    />
                    {item ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.unit.name}
                      </span>
                    ) : null}
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                    {item
                      ? format.number(item.price_cents / 100, {
                          style: "currency",
                          currency: "EUR",
                        })
                      : ""}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => removeRow(row.key)}
                  >
                    <Trash2Icon />
                    <span className="sr-only">{t("fields.remove")}</span>
                  </Button>
                </div>
              )
            })}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <PlusIcon data-icon="inline-start" />
            {t("fields.addItem")}
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>

      <Separator className="my-6" />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("fields.total")}</span>
        <span className="text-lg font-semibold tabular-nums">
          {format.number(totalCents / 100, { style: "currency", currency: "EUR" })}
        </span>
      </div>

      <DialogFooter className="mt-6">
        <Button type="submit" disabled={pending}>
          {t(recipe ? "editRecipe" : "newRecipe")}
        </Button>
      </DialogFooter>
    </form>
  )
}

function NewRecipeButton({ items }: { items: Item[] }) {
  const t = useTranslations("recipes")
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        {t("newRecipe")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newRecipe")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <RecipeForm items={items} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditRecipeButton({
  recipe,
  items,
}: {
  recipe: RecipeWithItems
  items: Item[]
}) {
  const t = useTranslations("recipes")
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" />
        }
      >
        <PencilIcon />
        <span className="sr-only">{t("editRecipe")}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editRecipe")}</DialogTitle>
          <DialogDescription>{recipe.name}</DialogDescription>
        </DialogHeader>
        <RecipeForm items={items} recipe={recipe} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export { NewRecipeButton, EditRecipeButton, RecipeForm }
