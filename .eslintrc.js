// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ["apps/**", "packages/**", "workers/**"],
  extends: ["@repo/eslint-config/base.js"],
  parser: "@typescript-eslint/parser",
}
