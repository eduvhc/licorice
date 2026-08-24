import { defineConfig } from "eslint/config"

import { config } from "@workspace/eslint-config/base"

export default defineConfig([
  ...config,
  {
    files: ["src/migrations/*.ts"],
    rules: {
      // `Kysely<any>` is correct here, not a shortcut. Kysely's docs are
      // explicit that a migration "should never depend on the current code of
      // your app... frozen in time" — typing one against today's schema breaks
      // it the moment that schema moves on, which is exactly when an old
      // migration still has to run against an empty database.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
])
