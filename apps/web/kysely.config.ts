import Database from "better-sqlite3"
import { SqliteDialect } from "kysely"
import { defineConfig } from "kysely-ctl"

export default defineConfig({
  dialect: new SqliteDialect({
    database: new Database("app.db"),
  }),
  migrations: {
    migrationFolder: "db/migrations",
  },
})
