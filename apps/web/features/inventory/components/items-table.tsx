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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { cn } from "@workspace/ui/lib/utils"
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"

import type { Tag, Unit } from "@/features/settings/server/queries"
import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"
import { ACTION_ERROR } from "@/shared/lib/action-result"

import {
  Link,
  usePathname,
  useRouter as useI18nRouter,
} from "@/i18n/navigation"
import { deleteItemAction } from "../server/actions"
import type { Item } from "../server/queries"
import { EditItemButton } from "./item-dialog"

function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Badge variant="outline" className="gap-1.5 text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          isTagColor(tag.color) ? tagColorDot[tag.color] : "bg-zinc-500"
        )}
      />
      {tag.name}
    </Badge>
  )
}

function TagFilter({
  tags,
  filterTagId,
}: {
  tags: Tag[]
  filterTagId: number | "all"
}) {
  const t = useTranslations("inventory")
  const pathname = usePathname()
  const router = useI18nRouter()

  const usedTags = tags

  function selectTag(value: number | "all") {
    router.replace(
      {
        pathname,
        query: value === "all" ? {} : { tag: String(value) },
      },
      { scroll: false }
    )
  }

  return (
    <ToggleGroup
      multiple={false}
      value={[String(filterTagId)]}
      onValueChange={(value) => {
        if (!value[0]) return
        selectTag(value[0] === "all" ? "all" : Number(value[0]))
      }}
      variant="outline"
      className="justify-start overflow-x-auto"
      role="group"
      aria-label={t("filter.label")}
    >
      <ToggleGroupItem value="all">{t("filter.all")}</ToggleGroupItem>
      {usedTags.map((tag) => (
        <ToggleGroupItem
          key={tag.id}
          value={String(tag.id)}
          className="gap-1.5"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isTagColor(tag.color) ? tagColorDot[tag.color] : "bg-zinc-500"
            )}
          />
          {tag.name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function ItemsTable({
  items,
  visibleItems,
  tags,
  units,
  filterTagId,
}: {
  items: Item[]
  visibleItems: Item[]
  tags: Tag[]
  units: Unit[]
  filterTagId: number | "all"
}) {
  const t = useTranslations("inventory")
  const format = useFormatter()
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()

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
        if (result.error === ACTION_ERROR.inUse) {
          toast.error(t("errors.inUse"), {
            description: (
              <div className="mt-1 flex flex-col gap-1">
                {result.recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={{
                      pathname: "/dashboard/recipes",
                      query: { open: recipe.id },
                    }}
                    className="underline underline-offset-2 hover:no-underline"
                  >
                    {recipe.name}
                  </Link>
                ))}
              </div>
            ),
            duration: 8000,
          })
          return
        }

        toast.error(t(`errors.${result.error}`))
        return
      }

      toast.success(t("toast.deleted"))
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <TagFilter tags={tags} filterTagId={filterTagId} />

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
                    <TagBadge tag={item.tag} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.unit.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {format.number(item.price_cents / 100, {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <EditItemButton item={item} tags={tags} units={units} />
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
                            onClick={() => handleDelete(item.id)}
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
