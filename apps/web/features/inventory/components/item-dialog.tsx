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
import { PencilIcon, PlusIcon } from "lucide-react"

import { ITEM_TYPES, itemTypeDot, type ItemType } from "../lib/item-types"
import { saveItemAction } from "../server/actions"
import type { Item } from "../server/queries"

function ItemForm({
  item,
  onDone,
}: {
  item?: Item
  onDone: () => void
}) {
  const t = useTranslations("inventory")
  const router = useRouter()
  const [type, setType] = React.useState<ItemType>(item?.type ?? "base")
  const [, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

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
          unit: String(formData.get("unit") ?? "") || "un",
          priceCents: Math.round(price * 100),
          type,
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
          <FieldLabel htmlFor="item-type">{t("fields.type")}</FieldLabel>
          <Select
            value={type}
            onValueChange={(value) => setType(value as ItemType)}
            items={ITEM_TYPES.map((option) => ({
              label: t(`types.${option}`),
              value: option,
            }))}
          >
            <SelectTrigger id="item-type" className="w-full">
              <SelectValue placeholder={t("fields.selectType")} />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${itemTypeDot[option]}`} />
                    {t(`types.${option}`)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="item-unit">{t("fields.unit")}</FieldLabel>
            <Input
              id="item-unit"
              name="unit"
              placeholder={t("fields.unitPlaceholder")}
              defaultValue={item?.unit ?? "un"}
              required
              maxLength={16}
            />
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

function NewItemButton() {
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
        <ItemForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditItemButton({ item }: { item: Item }) {
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
        <ItemForm item={item} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export { NewItemButton, EditItemButton }
