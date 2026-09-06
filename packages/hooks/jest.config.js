/** @type {import('jest').Config} */
module.exports = {
  ...require('@workspace/config/jest.config.expo.cjs'),
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@react-native-community/netinfo$': '@react-native-community/netinfo/jest/netinfo-mock.js',
  },
};
