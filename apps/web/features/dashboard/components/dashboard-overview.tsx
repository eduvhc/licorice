import { getFormatter, getTranslations } from "next-intl/server"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  BookOpenIcon,
  CoinsIcon,
  PackageIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Link } from "@/i18n/navigation"

import {
  getDashboardStats,
  listRecipes,
} from "@/features/recipes/server/queries"

async function DashboardOverview() {
  const [t, tRecipes, format] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("recipes"),
    getFormatter(),
  ])
  const [stats, recipes] = await Promise.all([
    getDashboardStats(),
    listRecipes(),
  ])
  const money = (cents: number) =>
    format.number(cents / 100, { style: "currency", currency: "EUR" })

  const cards = [
    {
      label: tRecipes("overview.recipes"),
      value: String(stats.recipeCount),
      icon: BookOpenIcon,
    },
    {
      label: tRecipes("overview.items"),
      value: String(stats.itemCount),
      icon: PackageIcon,
    },
    {
      label: tRecipes("overview.inventoryValue"),
      value: money(stats.inventoryValueCents),
      icon: CoinsIcon,
    },
    {
      label: tRecipes("overview.avgCost"),
      value: stats.hasRange
        ? tRecipes("overview.avgCostRange", {
            low: money(stats.avgRecipeLowCents),
            high: money(stats.avgRecipeHighCents),
          })
        : money(stats.avgRecipeLowCents),
      icon: TrendingUpIcon,
    },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("overview.title")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("overview.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {cards.map((card) => (
          <Card key={card.label} className="@container/card">
            <CardHeader>
              <CardDescription className="truncate">
                {card.label}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                  <card.icon className="size-4 text-muted-foreground" />
                </div>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tRecipes("overview.recentRecipes")}
          </CardTitle>
          <CardAction>
            <Link
              href="/dashboard/recipes"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {tRecipes("overview.viewAll")}
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              {t("overview.emptyRecipes")}
            </div>
          ) : (
            <div className="grid gap-2">
              {recipes.slice(0, 5).map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {recipe.name}
                    </div>
                    {recipe.description ? (
                      <div className="truncate text-xs text-muted-foreground">
                        {recipe.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {recipe.groups.reduce(
                        (sum, g) => sum + 1 + g.alternatives.length,
                        0
                      )}
                    </Badge>
                    <span className="text-sm font-medium tabular-nums">
                      {recipe.hasRange
                        ? tRecipes("overview.avgCostRange", {
                            low: money(recipe.totalLowCents),
                            high: money(recipe.totalHighCents),
                          })
                        : money(recipe.totalLowCents)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { DashboardOverview }
