import { InventoryPage } from "@/features/inventory/components/inventory-page"

type InventoryRouteProps = {
  searchParams: Promise<{
    tag?: string
  }>
}

export default async function Page({ searchParams }: InventoryRouteProps) {
  const { tag } = await searchParams
  const tagId = tag ? Number(tag) : NaN
  const filterTagId = Number.isInteger(tagId) && tagId > 0 ? tagId : "all"

  return <InventoryPage filterTagId={filterTagId} />
}
