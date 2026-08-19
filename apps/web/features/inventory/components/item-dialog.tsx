"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
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
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { PencilIcon, PlusIcon } from "lucide-react"

import type { Tag, Unit } from "@/features/settings/server/queries"
import { isTagColor, tagColorDot } from "@/features/settings/lib/tag-colors"

import { saveItemAction } from "../server/actions"
import type { Item } from "../server/queries"

function ItemForm({
  item,
  tags,
  units,
  onDone,
}: {
  item?: Item
  tags: Tag[]
  units: Unit[]
  onDone: () => void
}) {
  const t = useTranslations("inventory")
  const router = useRouter()
  const [tagId, setTagId] = React.useState<number>(item?.tag.id ?? tags[0]?.id ?? 0)
  const [unitId, setUnitId] = React.useState<number>(item?.unit.id ?? units[0]?.id ?? 0)
  const [error, setError] = React.useState<string | null>(null)
  const [, startTransition] = React.useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const price = Number.parseFloat(String(formData.get("price") ?? "").replace(",", "."))

    if (Number.isNaN(price) || price < 0) {
      setError(t("errors.invalid"))
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await saveItemAction(
        {
          name: String(formData.get("name") ?? ""),
          priceCents: Math.round(price * 100),
          tagId,
          unitId,
        },
        item?.id
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
          <FieldLabel htmlFor="item-name">{t("fields.name")}</FieldLabel>
          <Input
            id="item-name"
            name="name"
            placeholder={t("fields.namePlaceholder")}
            defaultValue={item?.name}
            required
            maxLength={120}
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="item-tag">{t("fields.type")}</FieldLabel>
          <Select
            value={tagId ? String(tagId) : undefined}
            onValueChange={(value) => setTagId(Number(value))}
            items={tags.map((tag) => ({ label: tag.name, value: String(tag.id) }))}
          >
            <SelectTrigger id="item-tag" className="w-full">
              <SelectValue placeholder={t("fields.selectType")} />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={String(tag.id)}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isTagColor(tag.color) ? tagColorDot[tag.color] : "bg-zinc-500"
                      )}
                    />
                    {tag.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="item-unit">{t("fields.unit")}</FieldLabel>
            <Select
              value={unitId ? String(unitId) : undefined}
              onValueChange={(value) => setUnitId(Number(value))}
              items={units.map((unit) => ({ label: unit.name, value: String(unit.id) }))}
            >
              <SelectTrigger id="item-unit" className="w-full">
                <SelectValue placeholder={t("fields.unitPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="item-price">{t("fields.price")}</FieldLabel>
            <Input
              id="item-price"
              name="price"
              type="text"
              inputMode="decimal"
              placeholder={t("fields.pricePlaceholder")}
              defaultValue={item ? (item.price_cents / 100).toFixed(2) : undefined}
              required
            />
          </Field>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">{t(item ? "editItem" : "newItem")}</Button>
      </DialogFooter>
    </form>
  )
}

function NewItemButton({ tags, units }: { tags: Tag[]; units: Unit[] }) {
  const t = useTranslations("inventory")
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        {t("newItem")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newItem")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <ItemForm tags={tags} units={units} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditItemButton({
  item,
  tags,
  units,
}: {
  item: Item
  tags: Tag[]
  units: Unit[]
}) {
  const t = useTranslations("inventory")
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" />
        }
      >
        <PencilIcon />
        <span className="sr-only">{t("editItem")}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editItem")}</DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </DialogHeader>
        <ItemForm item={item} tags={tags} units={units} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export { NewItemButton, EditItemButton }
