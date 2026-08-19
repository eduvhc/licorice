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

import { TAG_COLORS, tagColorDot, type TagColor } from "../lib/tag-colors"
import {
  saveBottleAction,
  saveTagAction,
  saveUnitAction,
  type SettingsActionResult,
} from "../server/actions"
import type { Bottle, Tag, Unit } from "../server/queries"

function useSave(
  action: (input: unknown, id?: number) => Promise<SettingsActionResult>,
  onDone: () => void
) {
  const t = useTranslations("settings")
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [, startTransition] = React.useTransition()

  function run(input: unknown, id?: number) {
    setError(null)
    startTransition(async () => {
      const result = await action(input, id)

      if (!result.ok) {
        setError(t(`errors.${result.error}`))
        return
      }

      toast.success(t("toast.saved"))
      onDone()
      router.refresh()
    })
  }

  return { error, run }
}

function UnitForm({ unit, onDone }: { unit?: Unit; onDone: () => void }) {
  const t = useTranslations("settings")
  const { error, run } = useSave(saveUnitAction, onDone)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const name = String(new FormData(event.currentTarget).get("name") ?? "")
        run({ name }, unit?.id)
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="unit-name">{t("units.fields.name")}</FieldLabel>
          <Input
            id="unit-name"
            name="name"
            placeholder={t("units.fields.namePlaceholder")}
            defaultValue={unit?.name}
            required
            maxLength={16}
            autoFocus
          />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">{t(unit ? "units.edit" : "units.new")}</Button>
      </DialogFooter>
    </form>
  )
}

function TagForm({ tag, onDone }: { tag?: Tag; onDone: () => void }) {
  const t = useTranslations("settings")
  const { error, run } = useSave(saveTagAction, onDone)
  const [color, setColor] = React.useState<TagColor>(
    (tag?.color as TagColor | undefined) ?? "zinc"
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const name = String(new FormData(event.currentTarget).get("name") ?? "")
        run({ name, color }, tag?.id)
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="tag-name">{t("tags.fields.name")}</FieldLabel>
          <Input
            id="tag-name"
            name="name"
            placeholder={t("tags.fields.namePlaceholder")}
            defaultValue={tag?.name}
            required
            maxLength={60}
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tag-color">{t("tags.fields.color")}</FieldLabel>
          <Select
            value={color}
            onValueChange={(value) => setColor(value as TagColor)}
            items={TAG_COLORS.map((option) => ({
              label: option,
              value: option,
            }))}
          >
            <SelectTrigger id="tag-color" className="w-full">
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
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">{t(tag ? "tags.edit" : "tags.new")}</Button>
      </DialogFooter>
    </form>
  )
}

function BottleForm({
  bottle,
  onDone,
}: {
  bottle?: Bottle
  onDone: () => void
}) {
  const t = useTranslations("settings")
  const { error, run } = useSave(saveBottleAction, onDone)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const name = String(formData.get("name") ?? "")
        const sizeMl = Number.parseInt(String(formData.get("sizeMl") ?? ""), 10)
        const price = Number.parseFloat(
          String(formData.get("price") ?? "").replace(",", ".")
        )

        if (
          !name.trim() ||
          Number.isNaN(sizeMl) ||
          Number.isNaN(price) ||
          price < 0
        ) {
          return
        }

        run({ name, sizeMl, priceCents: Math.round(price * 100) }, bottle?.id)
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="bottle-name">
            {t("bottles.fields.name")}
          </FieldLabel>
          <Input
            id="bottle-name"
            name="name"
            placeholder={t("bottles.fields.namePlaceholder")}
            defaultValue={bottle?.name}
            required
            maxLength={60}
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bottle-size">
            {t("bottles.fields.sizeMl")}
          </FieldLabel>
          <Input
            id="bottle-size"
            name="sizeMl"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={bottle?.sizeMl}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bottle-price">
            {t("bottles.fields.price")}
          </FieldLabel>
          <Input
            id="bottle-price"
            name="price"
            type="text"
            inputMode="decimal"
            placeholder={t("bottles.fields.pricePlaceholder")}
            defaultValue={
              bottle ? (bottle.priceCents / 100).toFixed(2) : undefined
            }
            required
          />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">
          {t(bottle ? "bottles.edit" : "bottles.new")}
        </Button>
      </DialogFooter>
    </form>
  )
}

function NewEntityButton({ kind }: { kind: "unit" | "tag" | "bottle" }) {
  const t = useTranslations("settings")
  const [open, setOpen] = React.useState(false)
  const label =
    kind === "unit"
      ? t("units.new")
      : kind === "tag"
        ? t("tags.new")
        : t("bottles.new")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon data-icon="inline-start" />
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        {kind === "unit" ? (
          <UnitForm onDone={() => setOpen(false)} />
        ) : kind === "tag" ? (
          <TagForm onDone={() => setOpen(false)} />
        ) : (
          <BottleForm onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EditEntityButton({
  kind,
  unit,
  tag,
  bottle,
}: {
  kind: "unit" | "tag" | "bottle"
  unit?: Unit
  tag?: Tag
  bottle?: Bottle
}) {
  const t = useTranslations("settings")
  const [open, setOpen] = React.useState(false)
  const label =
    kind === "unit"
      ? t("units.edit")
      : kind === "tag"
        ? t("tags.edit")
        : t("bottles.edit")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
          />
        }
      >
        <PencilIcon />
        <span className="sr-only">{label}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            {unit?.name ?? tag?.name ?? bottle?.name}
          </DialogDescription>
        </DialogHeader>
        {kind === "unit" ? (
          <UnitForm unit={unit} onDone={() => setOpen(false)} />
        ) : kind === "tag" ? (
          <TagForm tag={tag} onDone={() => setOpen(false)} />
        ) : (
          <BottleForm bottle={bottle} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { NewEntityButton, EditEntityButton }
