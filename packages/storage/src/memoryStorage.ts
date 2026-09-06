import type { Storage } from "./types";

// Non-persistent, in-process only — data is lost on restart and is never
// shared across app instances. For Jest/unit tests only; never use this as
// a production or Expo Go substitute for mmkvStorage (see README).
const store = new Map<string, string>();

export const memoryStorage: Storage = {
  get<T = unknown>(key: string): T | null {
    const raw = store.get(key);
    return raw === undefined ? null : (JSON.parse(raw) as T);
  },
  set<T = unknown>(key: string, value: T): void {
    store.set(key, JSON.stringify(value));
  },
  delete(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },
};
