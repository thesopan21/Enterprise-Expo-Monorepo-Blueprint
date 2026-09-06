# @workspace/auth

Authentication session lifecycle: login/logout, JWT decode, access/refresh
token handling, SecureStore-backed persistence, session restoration on app
start.

## `sessionManager`

The wired-up singleton (`secureStore` adapter + `createSessionManager`).
`getAccessToken`/`getRefreshToken` are synchronous, in-memory reads —
call `restoreSession()` once on app start to hydrate the cache from
SecureStore before relying on them.

`@workspace/api` (Phase 8) is designed to consume the `TokenProvider`
shape (`getAccessToken`, `getRefreshToken`, `setSession`, `clearSession`)
by dependency injection — it should depend on that interface, never
import this package's implementation, to avoid an `auth` <-> `api` import
cycle (enforced by the `import/no-cycle` ESLint rule).

## Testing note

`session.ts` takes its `SecureStoreAdapter` by injection with no default,
specifically so it never imports `secureStore.ts` (and therefore never
imports `expo-secure-store`, which — like `react-native-mmkv` — ships
ESM-only and cannot be `require()`'d under a `ts-jest`/CommonJS setup).
Session tests use a mocked adapter; only `index.ts` wires the real one.

## `jwt.ts` — decode only

`decodeJwt`/`isJwtExpired` never verify a token's signature — the server
is the source of truth for validity. This is for reading claims
client-side only (e.g. deciding whether to proactively refresh).

## What can't be validated here

SecureStore has no meaningful web/simulator-only substitute for
production behavior (Keychain on iOS, Keystore-backed
`EncryptedSharedPreferences` on Android). Its actual persistence —
surviving an app restart, real device behavior — can only be verified on
a Development Build, which happens in Phase 11 (Native/CNG Validation),
not here.
