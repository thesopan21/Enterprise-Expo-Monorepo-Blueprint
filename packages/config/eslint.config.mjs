import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";

/**
 * Framework-agnostic base ESLint config: TypeScript + import ordering.
 * Consumed directly by plain packages, and layered under `eslint.expo.mjs`
 * for apps/RN packages.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    plugins: {
      onlyWarn,
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".expo/**", ".turbo/**"],
  },
];

export default baseConfig;
