/** @type {import('jest').Config} */
module.exports = {
  ...require('@workspace/config/jest.config.base.cjs'),
  // Store's tests render React components (via @testing-library/react) to
  // exercise RTK Query hooks — needs a DOM, unlike the other ts-jest packages.
  testEnvironment: 'jsdom',
};
