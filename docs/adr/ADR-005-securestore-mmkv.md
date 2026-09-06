# ADR-005 — SecureStore + MMKV

## Context

The app needs two distinct kinds of persistence: authentication tokens
(which must be encrypted at rest, since compromise means account takeover)
and general key-value app data (which needs to be fast and synchronous, but
isn't uniformly sensitive).

## Decision

- **`expo-secure-store`** (Keychain on iOS, `EncryptedSharedPreferences` on
  Android) for tokens only — `packages/auth/src/secureStore.ts`, storing
  access/refresh tokens under separate keys.
- **`react-native-mmkv` v4** (`packages/storage/src/mmkvStorage.ts`) for
  general key-value storage — chosen over `@react-native-async-storage/
async-storage` for its synchronous API (no `await` needed for reads
  already in memory) and significantly faster read/write performance,
  vetted explicitly during Phase 6 rather than defaulted to.

## Alternatives

- **MMKV for tokens too** — rejected: MMKV is fast but not encrypted at rest
  by default in a way that meets the bar for credential storage; SecureStore
  is the OS-native mechanism specifically designed for that threat model.
- **AsyncStorage for general storage** — rejected: async-only API,
  measurably slower than MMKV, and no longer actively developed at the pace
  MMKV is. The tradeoff accepted in exchange: MMKV requires a Development
  Build (unavailable in Expo Go) — documented explicitly in
  `packages/storage/README.md` rather than discovered as a surprise crash.
- **A single unified storage abstraction for both** — rejected: tokens and
  general app data have genuinely different requirements (encryption
  guarantees, synchronous access patterns), and collapsing them into one
  interface would either weaken the token path's security guarantee or
  over-complicate the general-storage path for no benefit.

## Consequences

- `packages/auth/src/session.ts` takes its `SecureStoreAdapter` via
  **required dependency injection** (no default), specifically so it never
  imports the real, ESM-only `expo-secure-store` module — keeping it
  unit-testable under `ts-jest`/CommonJS without native mocking. Only
  `packages/auth/src/index.ts` wires the real singleton.
- `packages/storage/src/mmkvStorage.ts` constructs its MMKV instance lazily
  and wraps construction in a try/catch that raises a clear, actionable
  error ("MMKV requires a Development Build — not supported in Expo Go")
  instead of a cryptic native crash — the same discipline later applied to
  `expo-notifications` in Phase 17.
- `@react-native/jest-preset`'s TypeScript+ESM handling still doesn't apply
  to plain `ts-jest`-based packages; both `react-native-mmkv` and
  `expo-secure-store` being ESM-only was a real, previously-undiscovered
  blocker resolved via the same dependency-injection pattern, not by
  fighting the test runner's module system.
