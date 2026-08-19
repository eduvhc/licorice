import { getTranslations } from "next-intl/server"

import { Card, CardContent } from "@workspace/ui/components/card"

import { ItemsTable } from "./items-table"
import { NewItemButton } from "./item-dialog"
import { listItems } from "../server/queries"

async function InventoryPage() {
  const t = await getTranslations("inventory")
  const items = await listItems()

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <NewItemButton />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ItemsTable items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

export { InventoryPage }
