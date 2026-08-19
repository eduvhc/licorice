"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ChevronDownIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react"

import type { Item } from "@/features/inventory/server/queries"
import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import type { Bottle } from "@/features/settings/server/queries"
import { usePathname, useRouter as useI18nRouter } from "@/i18n/navigation"
import { cn } from "@workspace/ui/lib/utils"

import { deleteRecipeAction } from "../server/actions"
import { DEFAULT_MARGIN_PERCENT } from "../lib/pricing"
import { useDebouncedQueryValue } from "../lib/use-debounced-query-value"
import type { RecipeWithItems } from "../server/queries"
import { EditRecipeButton } from "./recipe-dialog"
import { RecipeCostBreakdown } from "./recipe-cost-breakdown"

const QUERY_SYNC_DELAY_MS = 400

function formatQuantity(
  format: ReturnType<typeof useFormatter>,
  value: number
) {
  return format.number(value, { maximumFractionDigits: 3 })
}

function RecipesTable({
  recipes,
  items,
  openRecipeId,
  marginPercent,
  bottles,
  batchMl,
}: {
  recipes: RecipeWithItems[]
  items: Item[]
  openRecipeId: number | null
  marginPercent: number
  bottles: Bottle[]
  batchMl: number | null
}) {
  const t = useTranslations("recipes")
  const format = useFormatter()
  const router = useRouter()
  const pathname = usePathname()
  const i18nRouter = useI18nRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = React.useTransition()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [highlightId, setHighlightId] = React.useState<number | null>(null)
  const rowRefs = React.useRef(new Map<number, HTMLTableRowElement>())

  React.useEffect(() => {
    if (openRecipeId === null) return

    const row = rowRefs.current.get(openRecipeId)
    if (!row) return

    row.scrollIntoView({ behavior: "smooth", block: "center" })
    setHighlightId(openRecipeId)
    const timeout = setTimeout(() => setHighlightId(null), 1500)
    return () => clearTimeout(timeout)
  }, [openRecipeId])

  function updateQuery(next: {
    open?: number | null
    margin?: number | null
    batchMl?: number | null
  }) {
    const params = new URLSearchParams(searchParams)

    if ("open" in next) {
      if (next.open === null) {
        params.delete("open")
      } else {
        params.set("open", String(next.open))
      }
    }

    if ("margin" in next) {
      if (next.margin === null || next.margin === DEFAULT_MARGIN_PERCENT) {
        params.delete("margin")
      } else {
        params.set("margin", String(next.margin))
      }
    }

    if ("batchMl" in next) {
      if (next.batchMl === null) {
        params.delete("batchMl")
      } else {
        params.set("batchMl", String(next.batchMl))
      }
    }

    i18nRouter.replace(
      { pathname, query: Object.fromEntries(params) },
      { scroll: false }
    )
  }

  const [localMargin, setLocalMargin] = useDebouncedQueryValue(
    marginPercent,
    (value) => updateQuery({ margin: value }),
    QUERY_SYNC_DELAY_MS
  )
  const [localBatchMl, setLocalBatchMl] = useDebouncedQueryValue(
    batchMl,
    (value) => updateQuery({ batchMl: value }),
    QUERY_SYNC_DELAY_MS
  )

  function handleToggle(recipeId: number, open: boolean) {
    updateQuery({ open: open ? recipeId : null })
  }

  if (recipes.length === 0) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {t("empty")}
      </div>
    )
  }

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteRecipeAction(id)
      setPendingId(null)

      if (!result.ok) {
        toast.error(t(`errors.${result.error}`))
        return
      }

      toast.success(t("toast.deleted"))
      router.refresh()
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("table.name")}</TableHead>
          <TableHead>{t("table.items")}</TableHead>
          <TableHead className="text-right">{t("table.total")}</TableHead>
          <TableHead className="w-24">
            <span className="sr-only">{t("table.actions")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      {recipes.map((recipe) => {
        const isOpen = openRecipeId === recipe.id

        return (
          <Collapsible
            key={recipe.id}
            render={<tbody />}
            open={isOpen}
            onOpenChange={(open) => handleToggle(recipe.id, open)}
          >
            <TableRow
              ref={(el) => {
                if (el) rowRefs.current.set(recipe.id, el)
                else rowRefs.current.delete(recipe.id)
              }}
              className={cn(
                pendingId === recipe.id && "opacity-50",
                highlightId === recipe.id &&
                  "bg-primary/10 transition-colors duration-1000"
              )}
            >
              <TableCell>
                <div className="font-medium">{recipe.name}</div>
                {recipe.description ? (
                  <div className="max-w-md truncate text-xs text-muted-foreground">
                    {recipe.description}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {recipe.items.map((item) => (
                    <span
                      key={`${recipe.id}-${item.itemId}`}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      <span
                        className={cn(
                          "mr-1 inline-block size-1.5 rounded-full align-middle",
                          isTagColor(item.tagColor)
                            ? tagColorDot[item.tagColor]
                            : "bg-zinc-500"
                        )}
                      />
                      {item.name} × {formatQuantity(format, item.quantity)}{" "}
                      {item.unitName}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {format.number(recipe.totalCents / 100, {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <EditRecipeButton recipe={recipe} items={items} />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                        />
                      }
                    >
                      <EllipsisVerticalIcon />
                      <span className="sr-only">{t("table.actions")}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(recipe.id)}
                      >
                        <Trash2Icon />
                        {t("deleteRecipe")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CollapsibleTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="group size-8 text-muted-foreground"
                      />
                    }
                  >
                    <ChevronDownIcon className="transition-transform group-data-[open]:rotate-180" />
                    <span className="sr-only">{t("breakdown.toggle")}</span>
                  </CollapsibleTrigger>
                </div>
              </TableCell>
            </TableRow>
            <CollapsibleContent render={<tr />}>
              <td colSpan={4} className="p-0">
                <div className="bg-muted/30 px-4">
                  <RecipeCostBreakdown
                    recipe={recipe}
                    marginPercent={isOpen ? localMargin : marginPercent}
                    onMarginPercentChange={setLocalMargin}
                    bottles={bottles}
                    batchMl={isOpen ? localBatchMl : batchMl}
                    onBatchMlChange={setLocalBatchMl}
                  />
                </div>
              </td>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </Table>
  )
}

export { RecipesTable }
