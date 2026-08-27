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
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import type { Item } from "@/features/inventory/server/queries"

import { deletePriceOfferAction, savePriceOfferAction } from "../server/actions"
import type { PriceOffer, Retailer } from "../server/queries"

function OfferForm({
  offer,
  retailers,
  items,
  onDone,
}: {
  offer?: PriceOffer
  retailers: Retailer[]
  items: Item[]
  onDone: () => void
}) {
  const t = useTranslations("pricing")
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [retailerId, setRetailerId] = React.useState<string>(
    String(offer?.retailerId ?? retailers[0]?.id ?? "")
  )
  const [itemId, setItemId] = React.useState<string>(
    String(offer?.itemId ?? items[0]?.id ?? "")
  )
  const [, startTransition] = React.useTransition()

  const selectedItem = items.find(
    (candidate) => String(candidate.id) === itemId
  )
  const retailName =
    retailers.find((candidate) => String(candidate.id) === retailerId)?.name ??
    ""

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const quantityRaw = String(formData.get("quantity") ?? "")
    const priceRaw = String(formData.get("price") ?? "").replace(",", ".")
    const quantity = Number.parseInt(quantityRaw, 10)
    const price = Number.parseFloat(priceRaw)
    const url = String(formData.get("url") ?? "").trim()

    if (
      !retailerId ||
      !selectedItem ||
      Number.isNaN(quantity) ||
      quantity <= 0 ||
      Number.isNaN(price) ||
      price < 0
    ) {
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await savePriceOfferAction(
        {
          retailerId: Number(retailerId),
          itemId: selectedItem.id,
          unitId: selectedItem.unit.id,
          quantity,
          priceCents: Math.round(price * 100),
          url,
        },
        offer?.id
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
          <FieldLabel htmlFor="offer-retailer">
            {t("offers.fields.retailer")}
          </FieldLabel>
          <Select
            value={retailerId}
            onValueChange={(value) => setRetailerId(value ?? "")}
          >
            <SelectTrigger id="offer-retailer" className="w-full">
              <SelectValue>{retailName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {retailers.map((retailer) => (
                <SelectItem key={retailer.id} value={String(retailer.id)}>
                  {retailer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="offer-item">
            {t("offers.fields.item")}
          </FieldLabel>
          <Select
            value={itemId}
            onValueChange={(value) => setItemId(value ?? "")}
          >
            <SelectTrigger id="offer-item" className="w-full">
              <SelectValue>{selectedItem?.name ?? ""}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="offer-quantity">
            {t("offers.fields.quantity")}
          </FieldLabel>
          <Input
            id="offer-quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={offer?.quantity}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="offer-price">
            {t("offers.fields.price")}
          </FieldLabel>
          <Input
            id="offer-price"
            name="price"
            type="text"
            inputMode="decimal"
            placeholder={t("offers.fields.pricePlaceholder")}
            defaultValue={
              offer ? (offer.priceCents / 100).toFixed(2) : undefined
            }
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="offer-url">{t("offers.fields.url")}</FieldLabel>
          <Input
            id="offer-url"
            name="url"
            type="url"
            placeholder={t("offers.fields.urlPlaceholder")}
            defaultValue={offer?.url || undefined}
            maxLength={300}
          />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">{t(offer ? "offers.edit" : "offers.new")}</Button>
      </DialogFooter>
    </form>
  )
}

export function OffersPanel({
  offers,
  retailers,
  items,
}: {
  offers: PriceOffer[]
  retailers: Retailer[]
  items: Item[]
}) {
  const t = useTranslations("pricing")
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<number | null>(null)
  const [, startTransition] = React.useTransition()
  const [openNew, setOpenNew] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<PriceOffer | null>(null)

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      const result = await deletePriceOfferAction(id)
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
      <div className="flex justify-end">
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon data-icon="inline-start" />
            {t("offers.new")}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("offers.new")}</DialogTitle>
            </DialogHeader>
            <OfferForm
              retailers={retailers}
              items={items}
              onDone={() => setOpenNew(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {offers.length === 0 ? (
        <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {t("offers.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("offers.table.retailer")}</TableHead>
                <TableHead>{t("offers.table.item")}</TableHead>
                <TableHead className="w-28 text-right">
                  {t("offers.table.package")}
                </TableHead>
                <TableHead className="w-24 text-right">
                  {t("offers.table.price")}
                </TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">{t("offers.table.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow
                  key={offer.id}
                  className={pendingId === offer.id ? "opacity-50" : undefined}
                >
                  <TableCell className="font-medium">
                    {offer.retailerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {offer.itemName}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {offer.quantity} {offer.unitName}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {(offer.priceCents / 100).toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() => setEditTarget(offer)}
                      >
                        <PencilIcon />
                        <span className="sr-only">{t("offers.edit")}</span>
                      </Button>
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
                          <span className="sr-only">{t("offers.delete")}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(offer.id)}
                          >
                            <Trash2Icon />
                            {t("offers.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={editTarget !== null}
        onOpenChange={() => setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("offers.edit")}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? `${editTarget.retailerName} · ${editTarget.itemName}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {editTarget ? (
            <OfferForm
              offer={editTarget}
              retailers={retailers}
              items={items}
              onDone={() => setEditTarget(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
