#!/usr/bin/env node
import { spawnSync } from "node:child_process"

const isWindows = process.platform === "win32"
const pnpm = isWindows ? "pnpm.cmd" : "pnpm"

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts })
  if (result.error) {
    console.error(`  ${cmd} failed: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
  return result
}

function runCapture(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: "utf8", shell: true })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
  return result.stdout ?? ""
}

const stagedFileOutput = runCapture("git", [
  "diff",
  "--cached",
  "--name-only",
  "--diff-filter=ACM",
])
const stagedFiles = stagedFileOutput.split(/\r?\n/).filter(Boolean)

const prettierFiles = stagedFiles.filter((file) =>
  /\.(ts|tsx|md|json)$/.test(file)
)
if (prettierFiles.length > 0) {
  run(pnpm, ["exec", "prettier", "--write", ...prettierFiles])
  run("git", ["add", ...prettierFiles])
}

const webFiles = stagedFiles
  .filter((file) => /^apps\/web\/.+\.(ts|tsx|js|jsx)$/.test(file))
  .map((file) => ({
    repoPath: file,
    relPath: file.replace(/^apps\/web\//, ""),
  }))

if (webFiles.length > 0) {
  run(
    pnpm,
    ["exec", "eslint", "--fix", ...webFiles.map((file) => file.relPath)],
    { cwd: "apps/web" }
  )
  run("git", ["add", ...webFiles.map((file) => file.repoPath)])
}
