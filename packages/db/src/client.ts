import Database from "better-sqlite3"
import { Kysely, SqliteDialect } from "kysely"

import { appDatabasePath } from "./paths.ts"
import type { AppSchema } from "./schema.ts"

/**
 * The application's database handle. Slices import this; nothing in a slice
 * opens its own connection.
 */
export const appDb = new Kysely<AppSchema>({
  dialect: new SqliteDialect({
    database: new Database(appDatabasePath()),
  }),
})
