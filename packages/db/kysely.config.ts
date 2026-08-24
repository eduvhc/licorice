import Database from "better-sqlite3"
import { defineConfig } from "kysely-ctl"

import { appDatabasePath } from "./src/paths.ts"

/**
 * kysely-ctl finds this file by walking up from the working directory, and
 * resolves `migrationFolder` relative to it. The same config serves local
 * authoring (`pnpm migrate:make`) and the deployed container, which is the
 * whole point: `kysely migrate:latest` means the same thing in both places.
 *
 * `dialectConfig` is a factory so the database path is read when the command
 * runs, not when the file is loaded — the container passes it as
 * APP_DATABASE_URL pointing at a mounted volume.
 */
export default defineConfig({
  dialect: "better-sqlite3",
  dialectConfig: () => ({ database: new Database(appDatabasePath()) }),
  migrations: {
    migrationFolder: "src/migrations",
  },
})
