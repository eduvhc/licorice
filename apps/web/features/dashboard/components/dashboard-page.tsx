import type { CSSProperties } from "react"

import { getTranslations } from "next-intl/server"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

import { AppSidebar } from "./app-sidebar"
import { ChartAreaInteractive } from "./chart-area-interactive"
import { DataTable } from "./data-table"
import { SectionCards } from "./section-cards"
import { SiteHeader } from "./site-header"
import { localizeDashboardRows } from "../lib/localize-rows"
import data from "../data/data.json"

type DashboardPageProps = {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

async function DashboardPage({ user }: DashboardPageProps) {
  const t = await getTranslations("dashboard")
  const localizedData = localizeDashboardRows(data, {
    rowContent: t.raw("rowContent"),
    table: {
      assignReviewer: t("table.assignReviewer"),
      statusOptions: t.raw("table.statusOptions"),
    },
  })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar
        user={{
          avatar: user.image ?? "",
          email: user.email,
          name: user.name,
        }}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={localizedData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { DashboardPage }
