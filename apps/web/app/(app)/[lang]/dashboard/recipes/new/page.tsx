import { listItems } from "@/features/inventory/server/queries"
import { RecipeEditor } from "@/features/recipes/components/recipe-editor"

export default async function Page() {
  const items = await listItems()

  return <RecipeEditor items={items} />
}
