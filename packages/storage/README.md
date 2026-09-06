# @workspace/storage

Typed key-value storage (`get`/`set`/`delete`/`clear`) for non-sensitive
local/persistent data.

## `mmkvStorage` — the real implementation

Backed by `react-native-mmkv` v4 (NitroModules-based). **Requires a
Development Build — it does not work in Expo Go.** Importing this module is
always safe; calling any of its methods without a Development Build throws
a clear `[@workspace/storage] Failed to initialize react-native-mmkv...`
error rather than a cryptic native crash. Native read/write behavior can
only be verified on a Development Build — that happens in Phase 11
(Native/CNG Validation), not here.

If MMKV/NitroModules ever prove incompatible with the current Expo SDK,
the documented fallback is `@react-native-async-storage/async-storage` —
a contingency, not the default plan.

## `memoryStorage` — test-only fallback

A non-persistent, in-process `Map`-backed implementation. **Use it only in
Jest/unit tests** — never as a production or Expo Go substitute for
`mmkvStorage`. Data does not survive a process restart and is never shared
across app instances.

## Testing note for consumers

`react-native-mmkv` v4 ships ESM-only (no CommonJS build). Metro/Babel
(jest-expo) transforms it fine, but a plain `ts-jest`/CommonJS test setup
cannot `require()` it at all. If your test suite uses a `ts-jest`-style
config (as `@workspace/theme` and this package do), import `memoryStorage`
directly — `import { memoryStorage } from '@workspace/storage/src/memoryStorage'`
— rather than through the package barrel, which also re-exports
`mmkvStorage` and would pull in `react-native-mmkv`'s ESM entry point.
