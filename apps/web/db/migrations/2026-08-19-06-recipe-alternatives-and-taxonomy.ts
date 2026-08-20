import { sql, type Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Free up canonical PT category names by archiving the original loose tags.
  await sql`UPDATE tags SET name = '_archived_' || id WHERE name IN ('Bebida base', 'Bebida', 'Fruta', 'Acessório', 'Outro')`.execute(
    db
  )

  // 2. Insert the refined 9-tier PT taxonomy. Color palette is stable so UI badge
  //    affordances stay consistent. Backfill script will retag existing items.
  await db
    .insertInto("tags")
    .values([
      { name: "Bebida alcoólica", color: "violet" },
      { name: "Outra bebida", color: "sky" },
      { name: "Adoçante", color: "amber" },
      { name: "Laticínio", color: "cyan" },
      { name: "Fruta", color: "lime" },
      { name: "Especiaria", color: "rose" },
      { name: "Café/Chá", color: "yellow" },
      { name: "Acessório", color: "orange" },
      { name: "Outro", color: "zinc" },
    ])
    .execute()

  // 3. Adjacency list: each recipe_item row in `recipe_items` is the canonical
  //    (primary) row for a group of alternatives; alternative rows live here.
  await db.schema
    .createTable("recipe_item_alternatives")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("primary_recipe_item_id", "integer", (col) =>
      col.notNull().references("recipe_items.id").onDelete("cascade")
    )
    .addColumn("item_id", "integer", (col) =>
      col.notNull().references("items.id").onDelete("restrict")
    )
    .addColumn("quantity", "real", (col) => col.notNull().defaultTo(1))
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(1))
    .execute()

  await db.schema
    .createIndex("recipe_item_alternatives_primary_index")
    .on("recipe_item_alternatives")
    .column("primary_recipe_item_id")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("recipe_item_alternatives").execute()
  await sql`DELETE FROM tags WHERE name IN ('Bebida alcoólica', 'Outra bebida', 'Adoçante', 'Laticínio', 'Especiaria', 'Café/Chá')`.execute(
    db
  )
}
