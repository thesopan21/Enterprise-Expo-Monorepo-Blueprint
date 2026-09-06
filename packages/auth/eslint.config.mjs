import { baseConfig } from "@workspace/config/eslint.config.mjs";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ["*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
