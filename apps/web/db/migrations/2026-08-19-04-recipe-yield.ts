import type { Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("recipes")
    .addColumn("yield_ml", "integer", (col) => col.notNull().defaultTo(1000))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("recipes").dropColumn("yield_ml").execute()
}
