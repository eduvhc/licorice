import { defineConfig, globalIgnores } from "eslint/config"
import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  globalIgnores(["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"]),
])
