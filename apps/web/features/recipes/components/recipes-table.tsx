"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { Link } from "@/i18n/navigation"
import { cn } from "@workspace/ui/lib/utils"

import { deleteRecipeAction } from "../server/actions"
import type { RecipeWithItems } from "../server/queries"

function countTotalIngredients(recipe: RecipeWithItems) {
  return recipe.groups.reduce(
    (sum, group) => sum + 1 + group.alternatives.length,
    0
  )
}

function RecipesTable({ recipes }: { recipes: RecipeWithItems[] }) {
  const t = useTranslations("recipes")
  const format = useFormatter()
  const router = useRouter()
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(
    null
  )
  const [, startTransition] = React.useTransition()

  function handleDelete(id: number) {
    if (pendingDeleteId !== null) return
    setPendingDeleteId(id)
    startTransition(async () => {
      const result = await deleteRecipeAction(id)
      setPendingDeleteId(null)
      if (!result.ok) {
        toast.error(t(`errors.${result.error}`))
        return
      }
      toast.success(t("toast.deleted"))
      router.refresh()
    })
  }

  if (recipes.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
        {t("empty")}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.name")}</TableHead>
            <TableHead className="text-right">{t("table.total")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe, index) => {
            const detailHref = `/dashboard/recipes/${recipe.id}`
            const pending = pendingDeleteId === recipe.id
            const totalItems = countTotalIngredients(recipe)

            return (
              <TableRow
                key={recipe.id}
                data-testid={`recipe-row-${recipe.id}`}
                data-recipe-index={index}
                className={cn(pending && "opacity-60")}
              >
                <TableCell className="max-w-0 py-3 whitespace-normal">
                  <Link href={detailHref} className="block">
                    <span className="line-clamp-1 font-medium text-foreground hover:underline">
                      {recipe.name}
                    </span>
                    {recipe.description ? (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {recipe.description}
                      </span>
                    ) : null}
                    <Badge
                      variant="outline"
                      className="mt-1 text-muted-foreground"
                    >
                      {t("card.itemsCount", { count: totalItems })}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell className="py-3 text-right whitespace-nowrap tabular-nums">
                  {recipe.hasRange ? (
                    <span className="font-semibold">
                      {t("breakdownPanel.costRange", {
                        low: format.number(recipe.totalLowCents / 100, {
                          style: "currency",
                          currency: "EUR",
                        }),
                        high: format.number(recipe.totalHighCents / 100, {
                          style: "currency",
                          currency: "EUR",
                        }),
                      })}
                    </span>
                  ) : (
                    <span className="font-semibold">
                      {format.number(recipe.totalLowCents / 100, {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3 pr-3">
                  <div className="flex items-center justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground"
                            aria-label={t("table.actions")}
                          />
                        }
                      >
                        <EllipsisVerticalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          render={<Link href={`${detailHref}/edit`} />}
                        >
                          <PencilIcon />
                          {t("editRecipe")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(recipe.id)}
                          disabled={pending}
                        >
                          <Trash2Icon />
                          {t("deleteRecipe")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      render={
                        <Link
                          href={detailHref}
                          aria-label={t("card.openDetails")}
                        />
                      }
                    >
                      <ChevronRightIcon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { RecipesTable }
