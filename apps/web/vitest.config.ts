import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      "server-only": path.resolve(
        import.meta.dirname,
        "./test/stubs/server-only.ts"
      ),
    },
  },
  test: {
    environment: "node",
    // .next/standalone contains a copy of this source tree, so without this
    // every test file is collected and run twice — once from the working tree
    // and once from whatever the last build froze in there.
    exclude: ["**/node_modules/**", "**/.next/**"],
    env: {
      BETTER_AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: "http://localhost:3000",
      DATABASE_URL: "./better-auth.db",
    },
  },
})
