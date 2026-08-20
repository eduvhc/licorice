import path from "node:path"
import { readdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import { Kysely, SqliteDialect } from "kysely"
import { Migrator, FileMigrationProvider } from "kysely/migration"

function resolveDatabasePath() {
  const databaseUrl = process.env.APP_DATABASE_URL

  if (!databaseUrl) {
    return path.join(process.cwd(), "app.db")
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.join(process.cwd(), databaseUrl)
}

async function migrate() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const migrationFolder = path.join(scriptDir, "..", "db", "migrations")

  const db = new Kysely({
    dialect: new SqliteDialect({
      database: new Database(resolveDatabasePath()),
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: { readdir },
      path,
      migrationFolder,
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  await db.destroy()

  if (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }

  for (const result of results ?? []) {
    console.log(`migration ${result.migrationName}: ${result.status}`)
  }
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
