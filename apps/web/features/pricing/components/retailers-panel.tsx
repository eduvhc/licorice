"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import {
  TAG_COLORS,
  tagColorDot,
  type TagColor,
} from "@/features/settings/lib/tag-colors"

import { deleteRetailerAction, saveRetailerAction } from "../server/actions"
import type { Retailer } from "../server/queries"

function RetailerForm({
  retailer,
  onDone,
}: {
  retailer?: Retailer
  onDone: () => void
}) {
  const t = useTranslations("pricing")
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [color, setColor] = React.useState<TagColor>(
    (retailer?.color as TagColor | undefined) ?? "zinc"
  )
  const [, startTransition] = React.useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const url = String(formData.get("url") ?? "").trim()
    if (!name) return

    setError(null)
    startTransition(async () => {
      const result = await saveRetailerAction(
        { name, color, url },
        retailer?.id
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

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="retailer-name">
            {t("retailers.fields.name")}
          </FieldLabel>
          <Input
            id="retailer-name"
            name="name"
            placeholder={t("retailers.fields.namePlaceholder")}
            defaultValue={retailer?.name}
            required
            maxLength={60}
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="retailer-color">
            {t("retailers.fields.color")}
          </FieldLabel>
          <Select
            value={color}
            onValueChange={(value) => setColor(value as TagColor)}
            items={TAG_COLORS.map((option) => ({
              label: option,
              value: option,
            }))}
          >
            <SelectTrigger id="retailer-color" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAG_COLORS.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        tagColorDot[option]
                      )}
                    />
                    <span className="capitalize">{option}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="retailer-url">
            {t("retailers.fields.url")}
          </FieldLabel>
          <Input
            id="retailer-url"
            name="url"
            type="url"
            placeholder={t("retailers.fields.urlPlaceholder")}
            defaultValue={retailer?.url || undefined}
            maxLength={300}
          />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">
          {t(retailer ? "retailers.edit" : "retailers.new")}
        </Button>
      </DialogFooter>
    </form>
  )
}

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

export function RetailersPanel({
  retailers,
  offerCountByRetailer,
}: {
  retailers: Retailer[]
  offerCountByRetailer: Map<number, number>
}) {
  const t = useTranslations("pricing")
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()
  const [openNew, setOpenNew] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Retailer | null>(null)

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteRetailerAction(id)
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
      <div className="flex justify-end gap-2">
        <Dialog
          open={editTarget !== null}
          onOpenChange={() => setEditTarget(null)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t("retailers.edit")}</DialogTitle>
              <DialogDescription>{editTarget?.name}</DialogDescription>
            </DialogHeader>
            {editTarget ? (
              <RetailerForm
                retailer={editTarget}
                onDone={() => setEditTarget(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon data-icon="inline-start" />
            {t("retailers.new")}
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t("retailers.new")}</DialogTitle>
            </DialogHeader>
            <RetailerForm onDone={() => setOpenNew(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {retailers.length === 0 ? (
        <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {t("retailers.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("retailers.table.name")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("retailers.table.url")}
                </TableHead>
                <TableHead className="w-20 text-right">
                  {t("retailers.table.offers")}
                </TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">
                    {t("retailers.table.actions")}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailers.map((retailer) => (
                <TableRow
                  key={retailer.id}
                  className={
                    pendingId === retailer.id ? "opacity-50" : undefined
                  }
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="gap-1.5 text-muted-foreground"
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          tagColorDot[retailer.color as TagColor] ??
                            "bg-zinc-500"
                        )}
                      />
                      {retailer.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {retailer.url ? (
                      <a
                        href={retailer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {retailer.url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {offerCountByRetailer.get(retailer.id) ?? 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() => setEditTarget(retailer)}
                      >
                        <PencilIcon />
                        <span className="sr-only">{t("retailers.edit")}</span>
                      </Button>
                      <DeleteMenu
                        label={t("retailers.delete")}
                        onDelete={() => handleDelete(retailer.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
