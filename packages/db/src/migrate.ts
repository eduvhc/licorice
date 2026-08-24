import path from "node:path"
import { readdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"

import Database from "better-sqlite3"
import { Kysely, SqliteDialect } from "kysely"
import { FileMigrationProvider, Migrator } from "kysely/migration"
import { getMigrations } from "better-auth/db/migration"

import { appDatabasePath, authDatabasePath } from "./paths.ts"

/**
 * The migrator: one program, two schemas, no build step.
 *
 * Migrations are TypeScript, and Node runs TypeScript directly — type
 * stripping has been on by default since Node 23.6 — so there is nothing to
 * transpile and no loader to install. That is why this does not use
 * kysely-ctl at run time: its entire runtime cost is `jiti` (a TypeScript
 * loader Node makes redundant) and `c12` (config discovery for a program that
 * has exactly one config). kysely-ctl stays a devDependency for scaffolding
 * new migration files, where it earns its keep.
 */

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const migrationFolder = path.join(scriptDir, "migrations")

async function migrateApp() {
  const databasePath = appDatabasePath()

  const db = new Kysely<unknown>({
    dialect: new SqliteDialect({ database: new Database(databasePath) }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: { readdir },
      path,
      migrationFolder,
      // A migration that is quietly skipped is the worst outcome: the app
      // starts, and the missing column surfaces later as a query error. Refuse
      // to run rather than run a set that is not the set on disk.
      onFileIgnored: (fileName, reason) => {
        throw new Error(
          `Refusing to migrate: ${fileName} in ${migrationFolder} was ignored (${reason}).`
        )
      },
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  await db.destroy()

  for (const result of results ?? []) {
    console.log(`  ${result.migrationName}: ${result.status}`)
  }

  if (error) throw error

  console.log(
    `app schema up to date: ${databasePath} (${results?.length ?? 0} applied)`
  )
}

/**
 * Better Auth owns its own tables and does not create them on demand. The CLI
 * that would (`@better-auth/cli migrate`) is not a dependency here, so the same
 * plan is executed in-process through the API that CLI is built on.
 *
 * Only schema-affecting options belong below. If a Better Auth plugin that
 * declares tables is ever added to apps/web/lib/auth.ts, it has to be added
 * here too, or its tables will silently never be created.
 */
async function migrateAuth() {
  const databasePath = authDatabasePath()

  const { runMigrations } = await getMigrations({
    database: new SqliteDialect({ database: new Database(databasePath) }),
    emailAndPassword: { enabled: true },
  })

  await runMigrations()
  console.log(`better-auth schema up to date: ${databasePath}`)
}

async function main() {
  await migrateAuth()
  await migrateApp()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
