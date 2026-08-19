"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"

import type { Item } from "@/features/inventory/server/queries"
import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import { cn } from "@workspace/ui/lib/utils"

import { deleteRecipeAction } from "../server/actions"
import type { RecipeWithItems } from "../server/queries"
import { EditRecipeButton } from "./recipe-dialog"

function formatQuantity(
  format: ReturnType<typeof useFormatter>,
  value: number
) {
  return format.number(value, { maximumFractionDigits: 3 })
}

function RecipesTable({
  recipes,
  items,
}: {
  recipes: RecipeWithItems[]
  items: Item[]
}) {
  const t = useTranslations("recipes")
  const format = useFormatter()
  const router = useRouter()
  const [, startTransition] = React.useTransition()
  const [pendingId, setPendingId] = React.useState<number | null>(null)

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
          <TableHead className="w-12">
            <span className="sr-only">{t("table.actions")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow
            key={recipe.id}
            className={pendingId === recipe.id ? "opacity-50" : undefined}
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
                      onSelect={() => handleDelete(recipe.id)}
                    >
                      <Trash2Icon />
                      {t("deleteRecipe")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { RecipesTable }
