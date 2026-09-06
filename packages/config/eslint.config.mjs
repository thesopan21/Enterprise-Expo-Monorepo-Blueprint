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
    settings: {
      // Without this, eslint-plugin-import can't correctly resolve
      // TS/exports-map packages, which silently breaks import/no-cycle's
      // external-module detection (it falls through to parsing raw
      // node_modules sources, e.g. react-native's Flow-typed internals).
      "import/resolver": {
        typescript: true,
      },
      // Belt-and-braces: never attempt to parse into node_modules for
      // export/cycle analysis — third-party RN packages ship Flow-typed
      // sources our parser can't read, and we only care about cycles
      // within our own workspace source anyway.
      "import/ignore": ["node_modules"],
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
      "import/no-cycle": ["error", { ignoreExternal: true }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".expo/**", ".turbo/**"],
  },
  {
    // Jest/babel config files are genuinely CommonJS (some forced to
    // .cjs specifically to sidestep this package's own "type": "module"),
    // so requiring them by path is correct, not a style violation.
    files: ["jest.config.*", "babel.config.*"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default baseConfig;
