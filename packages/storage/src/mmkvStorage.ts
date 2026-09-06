import { createMMKV, type MMKV } from 'react-native-mmkv';

import type { Storage } from './types';

// Constructed lazily so importing this module never crashes by itself —
// only actually using it in Expo Go (no Development Build) does, and with
// a clear message instead of a cryptic native error.
let instance: MMKV | undefined;

function getInstance(): MMKV {
  if (instance) {
    return instance;
  }

  try {
    instance = createMMKV();
  } catch (error) {
    throw new Error(
      '[@workspace/storage] Failed to initialize react-native-mmkv. MMKV requires a ' +
        'Development Build — it is not supported in Expo Go. See packages/storage/README.md.',
      { cause: error },
    );
  }

  return instance;
}

export const mmkvStorage: Storage = {
  get<T = unknown>(key: string): T | null {
    const raw = getInstance().getString(key);
    return raw === undefined ? null : (JSON.parse(raw) as T);
  },
  set<T = unknown>(key: string, value: T): void {
    getInstance().set(key, JSON.stringify(value));
  },
  delete(key: string): void {
    getInstance().remove(key);
  },
  clear(): void {
    getInstance().clearAll();
  },
};
