import type { Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("items")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("unit", "text", (col) => col.notNull().defaultTo("un"))
    .addColumn("price_cents", "integer", (col) => col.notNull().defaultTo(0))
    .execute()

  await db.schema
    .createTable("recipes")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull().defaultTo(""))
    .execute()

  await db.schema
    .createTable("recipe_items")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("recipe_id", "integer", (col) =>
      col.notNull().references("recipes.id").onDelete("cascade")
    )
    .addColumn("item_id", "integer", (col) =>
      col.notNull().references("items.id").onDelete("cascade")
    )
    .addColumn("quantity", "real", (col) => col.notNull().defaultTo(1))
    .execute()

  await db.schema
    .createIndex("recipe_items_recipe_id_index")
    .on("recipe_items")
    .column("recipe_id")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("recipe_items").execute()
  await db.schema.dropTable("recipes").execute()
  await db.schema.dropTable("items").execute()
}
