import { getTranslations } from "next-intl/server"

import { Card, CardContent } from "@workspace/ui/components/card"

import { listTags, listUnits } from "@/features/settings/server/queries"

import { ItemsTable } from "./items-table"
import { NewItemButton } from "./item-dialog"
import { listItems } from "../server/queries"

type InventoryPageProps = {
  filterTagId: number | "all"
}

async function InventoryPage({ filterTagId }: InventoryPageProps) {
  const t = await getTranslations("inventory")
  const [items, tags, units] = await Promise.all([
    listItems(),
    listTags(),
    listUnits(),
  ])
  const visibleItems =
    filterTagId === "all"
      ? items
      : items.filter((item) => item.tag.id === filterTagId)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <NewItemButton tags={tags} units={units} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ItemsTable
            items={items}
            visibleItems={visibleItems}
            tags={tags}
            units={units}
            filterTagId={filterTagId}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export { InventoryPage }
