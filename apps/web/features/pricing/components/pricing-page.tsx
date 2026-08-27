import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { listItems } from "@/features/inventory/server/queries"

import { OffersPanel } from "./offers-panel"
import { RetailersPanel } from "./retailers-panel"
import { listPriceOffers, listRetailers } from "../server/queries"

export async function PricingPage() {
  const t = await getTranslations("pricing")
  const [retailers, offers, items] = await Promise.all([
    listRetailers(),
    listPriceOffers(),
    listItems(),
  ])

  const offerCountByRetailer = new Map<number, number>()
  for (const offer of offers) {
    offerCountByRetailer.set(
      offer.retailerId,
      (offerCountByRetailer.get(offer.retailerId) ?? 0) + 1
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("retailers.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RetailersPanel
            retailers={retailers}
            offerCountByRetailer={offerCountByRetailer}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("offers.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <OffersPanel offers={offers} retailers={retailers} items={items} />
        </CardContent>
      </Card>
    </div>
  )
}
