/** @type {import('jest').Config} */
module.exports = {
  ...require('@workspace/config/jest.config.expo.cjs'),
  testMatch: ['**/*.test.tsx'],
};
