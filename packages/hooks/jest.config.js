/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@react-native-community/netinfo$': '@react-native-community/netinfo/jest/netinfo-mock.js',
  },
};
