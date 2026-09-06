/**
 * Framework-agnostic base Jest config: ts-jest, Node environment. For plain
 * TS packages (theme, storage, auth, api, store) — mirrors the
 * tsconfig.base.json / eslint.config.mjs split in this same package.
 * Consumers needing jsdom (e.g. store's React-rendering tests) spread this
 * and override `testEnvironment`.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  // A broken/unreachable watchman on the host makes Jest silently no-op
  // (exit 0, zero suites run, zero output) instead of falling back or
  // erroring — so don't depend on it being present or healthy at all.
  watchman: false,
};
