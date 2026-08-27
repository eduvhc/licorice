"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import {
  BookOpenIcon,
  CommandIcon,
  LayoutDashboardIcon,
  PackageIcon,
  StoreIcon,
  Settings2Icon,
  SettingsIcon,
} from "lucide-react"

import { Link as I18nLink } from "@/i18n/navigation"
import { usePathname } from "@/i18n/navigation"

const mainNav = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboardIcon },
  { key: "recipes", href: "/dashboard/recipes", icon: BookOpenIcon },
  { key: "inventory", href: "/dashboard/inventory", icon: PackageIcon },
  { key: "pricing", href: "/dashboard/pricing", icon: StoreIcon },
  { key: "settings", href: "/dashboard/settings", icon: SettingsIcon },
] as const

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const t = useTranslations("dashboard")
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<I18nLink href="/" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">{t("brand")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={t(`nav.${item.key}`)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{t(`nav.${item.key}`)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/account" />}>
                  <Settings2Icon />
                  <span>{t("manageAccount")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
