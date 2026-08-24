import { sql, type Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tags")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("color", "text", (col) => col.notNull().defaultTo("zinc"))
    .execute()

  await db.schema
    .createTable("units")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .execute()

  await db
    .insertInto("tags")
    .values([
      { name: "Bebida base", color: "violet" },
      { name: "Bebida", color: "sky" },
      { name: "Fruta", color: "lime" },
      { name: "Acessório", color: "amber" },
      { name: "Outro", color: "zinc" },
    ])
    .execute()

  await db
    .insertInto("units")
    .values([
      { name: "un" },
      { name: "ml" },
      { name: "cl" },
      { name: "L" },
      { name: "g" },
      { name: "kg" },
    ])
    .execute()

  await db.schema
    .alterTable("items")
    .addColumn("tag_id", "integer", (col) =>
      col.references("tags.id").onDelete("restrict")
    )
    .execute()

  await db.schema
    .alterTable("items")
    .addColumn("unit_id", "integer", (col) =>
      col.references("units.id").onDelete("restrict")
    )
    .execute()

  await sql`update items set tag_id = (
    select id from tags where name = case items.type
      when 'base' then 'Bebida base'
      when 'drink' then 'Bebida'
      when 'fruit' then 'Fruta'
      when 'accessory' then 'Acessório'
      else 'Outro'
    end
  )`.execute(db)

  await sql`update items set unit_id = (
    select id from units where name = items.unit
  )`.execute(db)

  await sql`update items set tag_id = (select id from tags where name = 'Outro')
    where tag_id is null`.execute(db)
  await sql`update items set unit_id = (select id from units where name = 'un')
    where unit_id is null`.execute(db)

  await db.schema.alterTable("items").dropColumn("type").execute()
  await db.schema.alterTable("items").dropColumn("unit").execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("items")
    .addColumn("type", "text", (col) => col.notNull().defaultTo("other"))
    .execute()
  await db.schema
    .alterTable("items")
    .addColumn("unit", "text", (col) => col.notNull().defaultTo("un"))
    .execute()

  await db.schema.alterTable("items").dropColumn("tag_id").execute()
  await db.schema.alterTable("items").dropColumn("unit_id").execute()

  await db.schema.dropTable("units").execute()
  await db.schema.dropTable("tags").execute()
}
