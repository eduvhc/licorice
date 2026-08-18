import path from "node:path"

import Database from "better-sqlite3"
import { Kysely, SqliteDialect } from "kysely"

type DatabaseSchema = Record<string, never>

function resolveDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return path.join(process.cwd(), "better-auth.db")
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.join(process.cwd(), databaseUrl)
}

export const databasePath = resolveDatabasePath()

const sqlite = new Database(databasePath)

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqlite,
  }),
})
