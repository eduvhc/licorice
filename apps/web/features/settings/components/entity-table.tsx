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

import { isTagColor, tagColorDot } from "../lib/tag-colors"
import {
  deleteBottleAction,
  deleteTagAction,
  deleteUnitAction,
} from "../server/actions"
import type { Bottle, Tag, Unit } from "../server/queries"
import { EditEntityButton } from "./entity-dialogs"

type Usage = Map<number, number>

function DeleteMenu({
  label,
  onDelete,
}: {
  label: string
  onDelete: () => void
}) {
  return (
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
        <span className="sr-only">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          {label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function UnitsSection({ units, usage }: { units: Unit[]; usage: Usage }) {
  const t = useTranslations("settings")
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()

  if (units.length === 0) {
    return <Empty message={t("units.empty")} />
  }

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteUnitAction(id)
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
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("units.table.name")}</TableHead>
            <TableHead className="w-24">{t("units.table.usage")}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t("units.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow
              key={unit.id}
              className={pendingId === unit.id ? "opacity-50" : undefined}
            >
              <TableCell className="font-medium">{unit.name}</TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {usage.get(unit.id) ?? 0}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <EditEntityButton kind="unit" unit={unit} />
                  <DeleteMenu
                    label={t("units.delete")}
                    onDelete={() => handleDelete(unit.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TagsSection({ tags, usage }: { tags: Tag[]; usage: Usage }) {
  const t = useTranslations("settings")
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()

  if (tags.length === 0) {
    return <Empty message={t("tags.empty")} />
  }

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteTagAction(id)
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
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("tags.table.name")}</TableHead>
            <TableHead className="w-24">{t("tags.table.usage")}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t("tags.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow
              key={tag.id}
              className={pendingId === tag.id ? "opacity-50" : undefined}
            >
              <TableCell>
                <Badge
                  variant="outline"
                  className="gap-1.5 text-muted-foreground"
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isTagColor(tag.color)
                        ? tagColorDot[tag.color]
                        : "bg-zinc-500"
                    )}
                  />
                  {tag.name}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {usage.get(tag.id) ?? 0}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <EditEntityButton kind="tag" tag={tag} />
                  <DeleteMenu
                    label={t("tags.delete")}
                    onDelete={() => handleDelete(tag.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function BottlesSection({ bottles }: { bottles: Bottle[] }) {
  const t = useTranslations("settings")
  const format = useFormatter()
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()

  if (bottles.length === 0) {
    return <Empty message={t("bottles.empty")} />
  }

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteBottleAction(id)
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
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("bottles.table.name")}</TableHead>
            <TableHead className="w-24">{t("bottles.table.size")}</TableHead>
            <TableHead className="w-28 text-right">
              {t("bottles.table.price")}
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t("bottles.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bottles.map((bottle) => (
            <TableRow
              key={bottle.id}
              className={pendingId === bottle.id ? "opacity-50" : undefined}
            >
              <TableCell className="font-medium">{bottle.name}</TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {bottle.sizeMl} ml
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {format.number(bottle.priceCents / 100, {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <EditEntityButton kind="bottle" bottle={bottle} />
                  <DeleteMenu
                    label={t("bottles.delete")}
                    onDelete={() => handleDelete(bottle.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { UnitsSection, TagsSection, BottlesSection }
