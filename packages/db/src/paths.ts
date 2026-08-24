import path from "node:path"

/**
 * Two SQLite files, two owners: Better Auth owns its own tables, this package
 * owns the application's. Both resolve the same way — an absolute path is used
 * as-is, a relative one is anchored to the working directory — so a container
 * can point them at a mounted volume while a developer leaves them in the
 * checkout.
 */
function resolve(value: string | undefined, fallback: string) {
  if (!value) return path.join(process.cwd(), fallback)
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value)
}

export function appDatabasePath() {
  return resolve(process.env.APP_DATABASE_URL, "app.db")
}

export function authDatabasePath() {
  return resolve(process.env.DATABASE_URL, "better-auth.db")
}
