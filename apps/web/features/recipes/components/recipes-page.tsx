import { getTranslations } from "next-intl/server"

import { Card, CardContent } from "@workspace/ui/components/card"

import { listItems } from "@/features/inventory/server/queries"

import { NewRecipeButton } from "./recipe-dialog"
import { RecipesTable } from "./recipes-table"
import { listRecipes } from "../server/queries"

async function RecipesPage() {
  const t = await getTranslations("recipes")
  const [recipes, items] = await Promise.all([listRecipes(), listItems()])

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <NewRecipeButton items={items} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <RecipesTable recipes={recipes} items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

export { RecipesPage }
