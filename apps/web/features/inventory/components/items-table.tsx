"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
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
import { cn } from "@workspace/ui/lib/utils"
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"

import { ITEM_TYPES, itemTypeDot, type ItemType } from "../lib/item-types"
import { deleteItemAction } from "../server/actions"
import type { Item } from "../server/queries"
import { EditItemButton } from "./item-dialog"

function formatPrice(
  format: ReturnType<typeof useFormatter>,
  cents: number
) {
  return format.number(cents / 100, { style: "currency", currency: "EUR" })
}

function TypeBadge({ type }: { type: ItemType }) {
  const t = useTranslations("inventory")

  return (
    <Badge variant="outline" className="gap-1.5 text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", itemTypeDot[type])} />
      {t(`types.${type}`)}
    </Badge>
  )
}

function ItemsTable({ items }: { items: Item[] }) {
  const t = useTranslations("inventory")
  const format = useFormatter()
  const router = useRouter()
  const [filter, setFilter] = React.useState<ItemType | "all">("all")
  const [, startTransition] = React.useTransition()
  const [pendingId, setPendingId] = React.useState<number | null>(null)

  const visibleItems =
    filter === "all" ? items : items.filter((item) => item.type === filter)

  if (items.length === 0) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {t("empty")}
      </div>
    )
  }

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteItemAction(id)
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
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label={t("filter.label")}
      >
        <Button
          type="button"
          variant={filter === "all" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => setFilter("all")}
        >
          {t("filter.all")}
        </Button>
        {ITEM_TYPES.map((type) => {
          const count = items.filter((item) => item.type === type).length

          if (count === 0) {
            return null
          }

          return (
            <Button
              key={type}
              type="button"
              variant={filter === type ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
              onClick={() => setFilter(type)}
            >
              <span className={cn("size-1.5 rounded-full", itemTypeDot[type])} />
              {t(`types.${type}`)}
              <span className="text-muted-foreground">{count}</span>
            </Button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead>{t("table.type")}</TableHead>
              <TableHead>{t("table.unit")}</TableHead>
              <TableHead className="text-right">{t("table.price")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{t("table.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-16 text-center text-muted-foreground"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={pendingId === item.id ? "opacity-50" : undefined}
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <TypeBadge type={item.type} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(format, item.price_cents)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <EditItemButton item={item} />
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
                            onSelect={() => handleDelete(item.id)}
                          >
                            <Trash2Icon />
                            {t("deleteItem")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export { ItemsTable }
