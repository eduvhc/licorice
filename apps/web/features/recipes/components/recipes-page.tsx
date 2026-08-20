import { getTranslations } from "next-intl/server"

import { Button } from "@workspace/ui/components/button"
import { Link } from "@/i18n/navigation"
import { PlusIcon } from "lucide-react"

import { RecipesTable } from "./recipes-table"
import { listRecipes } from "../server/queries"

async function RecipesPage() {
  const t = await getTranslations("recipes")
  const recipes = await listRecipes()

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button render={<Link href="/dashboard/recipes/new" />}>
          <PlusIcon data-icon="inline-start" />
          {t("newRecipe")}
        </Button>
      </div>

      <RecipesTable recipes={recipes} />
    </div>
  )
}

export { RecipesPage }
