import { getTranslations } from "next-intl/server"

import { Card, CardContent } from "@workspace/ui/components/card"
import { Tabs, TabsContent } from "@workspace/ui/components/tabs"

import { appDb } from "@/lib/app-db"

import { NewEntityButton } from "./entity-dialogs"
import { BottlesSection, TagsSection, UnitsSection } from "./entity-table"
import { SettingsTabs } from "./settings-tabs"
import { listBottles, listTags, listUnits } from "../server/queries"

async function buildUsage() {
  const rows = await appDb
    .selectFrom("items")
    .select(["tag_id", "unit_id"])
    .execute()

  const tagUsage = new Map<number, number>()
  const unitUsage = new Map<number, number>()

  for (const row of rows) {
    tagUsage.set(row.tag_id, (tagUsage.get(row.tag_id) ?? 0) + 1)
    unitUsage.set(row.unit_id, (unitUsage.get(row.unit_id) ?? 0) + 1)
  }

  return { tagUsage, unitUsage }
}

type SettingsPageProps = {
  tab: "units" | "tags" | "bottles"
}

async function SettingsPage({ tab }: SettingsPageProps) {
  const t = await getTranslations("settings")
  const [units, tags, bottles, usage] = await Promise.all([
    listUnits(),
    listTags(),
    listBottles(),
    buildUsage(),
  ])

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Tabs value={tab} className="gap-6">
        <SettingsTabs />
        <TabsContent value="units" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <NewEntityButton kind="unit" />
          </div>
          <Card>
            <CardContent className="pt-6">
              <UnitsSection units={units} usage={usage.unitUsage} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tags" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <NewEntityButton kind="tag" />
          </div>
          <Card>
            <CardContent className="pt-6">
              <TagsSection tags={tags} usage={usage.tagUsage} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bottles" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <NewEntityButton kind="bottle" />
          </div>
          <Card>
            <CardContent className="pt-6">
              <BottlesSection bottles={bottles} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SettingsPage }
