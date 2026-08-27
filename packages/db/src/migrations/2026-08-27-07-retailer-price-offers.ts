import { sql, type Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  // Retailers are where an ingredient or package can be bought. The color is a
  // stable UI badge affordance, mirroring tags.
  await db.schema
    .createTable("retailers")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("color", "text", (col) => col.notNull().defaultTo("zinc"))
    .addColumn("url", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("notes", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("created_at", "text", (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`)
    )
    .execute()

  // A price offer is one package of an item at one retailer: "at Continente,
  // Vodka 700 ml costs €12". `quantity` is expressed in the item's unit, so the
  // per-unit price is `price_cents / quantity`. This is what the per-retailer
  // recipe basket costing derives from.
  await db.schema
    .createTable("price_offers")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("retailer_id", "integer", (col) =>
      col.notNull().references("retailers.id").onDelete("restrict")
    )
    .addColumn("item_id", "integer", (col) =>
      col.notNull().references("items.id").onDelete("cascade")
    )
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("unit_id", "integer", (col) =>
      col.notNull().references("units.id").onDelete("restrict")
    )
    .addColumn("price_cents", "integer", (col) => col.notNull())
    .addColumn("valid_on", "text")
    .addColumn("url", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("notes", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("created_at", "text", (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`)
    )
    .execute()

  await db.schema
    .createIndex("price_offers_retailer_item_index")
    .on("price_offers")
    .columns(["retailer_id", "item_id"])
    .execute()
  await db.schema
    .createIndex("price_offers_item_index")
    .on("price_offers")
    .column("item_id")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("price_offers_item_index").execute()
  await db.schema.dropIndex("price_offers_retailer_item_index").execute()
  await db.schema.dropTable("price_offers").execute()
  await db.schema.dropTable("retailers").execute()
}
