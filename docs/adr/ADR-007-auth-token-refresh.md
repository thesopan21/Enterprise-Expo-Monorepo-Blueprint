# ADR-007 — Authentication and token refresh

## Context

API requests need a valid access token attached automatically, an expired
access token needs to trigger a refresh transparently, and multiple requests
failing with 401 at the same time must not each trigger their own redundant
refresh call (or race each other into an inconsistent session state).

## Decision

- `packages/auth/src/session.ts`'s `SessionManager` keeps an in-memory cache
  of the current tokens (populated from SecureStore via `restoreSession()`)
  so `getAccessToken()` can be **synchronous** — required by
  `packages/api/src/interceptors/auth.ts`'s per-request header injection,
  which runs inside axios's synchronous interceptor chain.
- `packages/api/src/interceptors/refresh.ts` implements **single-flight
  refresh**: a module-level `refreshPromise` is checked-and-set synchronously
  (no `await` between check and assignment), so every 401 that arrives while
  a refresh is already in flight awaits the _same_ promise instead of
  starting its own.
- A failed refresh clears the session and surfaces a distinct
  `SESSION_EXPIRED` `ApiError`; a failed _retry_ (after a successful refresh)
  is normalized as whatever it actually is (e.g. a real 500) — these are
  deliberately separate code paths, not conflated.

## Alternatives

- **Refresh tokens read directly from SecureStore per request** — rejected:
  SecureStore's API is async, and would force every outgoing request through
  an async round-trip before it could even attach a header, for data that
  changes rarely. The in-memory cache trades a small amount of
  eventual-consistency risk (a cleared session elsewhere in the app isn't
  reflected until the next `SessionManager` call) for synchronous access.
- **No single-flight guard (let every 401 refresh independently)** — rejected:
  under real conditions (several concurrent requests all failing together
  when a token expires) this either wastes a refresh-token's limited use
  count against a real backend, or races two refreshes against each other
  with no defined winner.
- **Treat retry failure the same as refresh failure** — rejected during this
  build's own first draft: conflating them would surface a legitimate 500
  error as a misleading "your session has expired" message.

## Consequences

- `packages/auth/src/session.ts` never imports `expo-secure-store` directly
  (dependency-injected adapter, per ADR-005) — testable without native
  mocking, validated by `session.test.ts`.
- The single-flight design was specifically verified for the race condition
  it exists to prevent: `refreshPromise` is set in the same synchronous tick
  it's checked, so there is no `await` gap two concurrent 401s could both
  observe as "unset."
- `app-one`'s current backend is an explicitly-documented mock
  (`authApi.ts`) — the refresh flow is exercised against a fake backend, not
  a real one, until a real backend exists (flagged in Phase 19's security
  review as a fixture that must not be mistaken for real credentials).
