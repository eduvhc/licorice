import type { Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("items")
    .addColumn("type", "text", (col) => col.notNull().defaultTo("other"))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("items").dropColumn("type").execute()
}
