import { SettingsPage } from "@/features/settings/components/settings-page"

type SettingsRouteProps = {
  searchParams: Promise<{
    tab?: string
  }>
}

export default async function Page({ searchParams }: SettingsRouteProps) {
  const { tab } = await searchParams

  const resolvedTab =
    tab === "tags" ? "tags" : tab === "bottles" ? "bottles" : "units"

  return <SettingsPage tab={resolvedTab} />
}
