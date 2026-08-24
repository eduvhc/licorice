/**
 * Better Auth's own database. Its schema is owned by Better Auth and created
 * by @workspace/db's migrate step, not by this app.
 */
import Database from "better-sqlite3"
import { Kysely } from "kysely"
import { SqliteDialect } from "kysely"

import { authDatabasePath } from "@workspace/db"

type DatabaseSchema = Record<string, never>

export const databasePath = authDatabasePath()

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: new Database(databasePath),
  }),
})
