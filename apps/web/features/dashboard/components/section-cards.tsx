"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SectionCards() {
  const t = useTranslations("dashboard")
  const cards = t.raw("cards") as {
    title: string
    trend: string
    detail: string
  }[]
  const values = ["$1,250.00", "1,234", "45,678", "4.5%"]
  const badges = ["+12.5%", "-20%", "+12.5%", "+4.5%"]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card, index) => {
        const TrendIcon =
          index === 1 ? TrendingDownIcon : TrendingUpIcon

        return (
          <Card key={card.title} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {values[index]}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon
                  />
                  {badges[index]}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.trend}{" "}
                <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">{card.detail}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
