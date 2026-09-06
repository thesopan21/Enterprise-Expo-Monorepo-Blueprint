/**
 * Expo/React Native overlay: jest-expo preset. For packages/apps that render
 * RN components (ui, hooks, apps/*) — mirrors the eslint.expo.mjs overlay in
 * this same package.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
};
