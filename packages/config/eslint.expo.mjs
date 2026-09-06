import eslintConfigPrettier from "eslint-config-prettier";
import expoConfig from "eslint-config-expo/flat.js";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * Expo/React Native overlay. `eslint-config-expo/flat` already covers
 * TypeScript, React, React Native and import resolution, so this does not
 * re-layer `baseConfig` from `eslint.config.mjs` (doing so would register
 * the TypeScript/import plugins twice under the same key with a different
 * instance, which ESLint's flat config rejects).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const expoOverlayConfig = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    plugins: {
      onlyWarn,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
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
      "import/no-cycle": ["error", { ignoreExternal: true }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".expo/**", ".turbo/**", "android/**", "ios/**"],
  },
];

export default expoOverlayConfig;
