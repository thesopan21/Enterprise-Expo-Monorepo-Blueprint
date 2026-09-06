import * as SecureStore from 'expo-secure-store';

import type { SecureStoreAdapter } from './types';

// Tokens are stored under separate keys (not a single combined blob) so
// each stays well under SecureStore's ~2048-byte per-value limit on
// Android (EncryptedSharedPreferences-backed).
const ACCESS_TOKEN_KEY = 'workspace.auth.accessToken';
const REFRESH_TOKEN_KEY = 'workspace.auth.refreshToken';

export const secureStore: SecureStoreAdapter = {
  async getAccessToken() {
    return (await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)) ?? null;
  },
  async getRefreshToken() {
    return (await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)) ?? null;
  },
  async setTokens(accessToken, refreshToken) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
