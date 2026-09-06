# Security Review Findings (Phase 19)

Audit against `01_plan_prompt.md` §23 (Security Requirements) and the
adjacent §24 (Environment Strategy) `EXPO_PUBLIC_*` secrets check. Every
item below was checked against the actual current codebase (grep sweeps
plus direct reads of the relevant source), not assumed from memory of
earlier phases. Status legend: **PASS** (checked, no issue), **N/A**
(nothing in the current codebase exercises this yet — documented so it
isn't silently skipped), **RISK** (a real, currently-latent issue with a
concrete recommendation).

## §23 checklist

### 1. Token storage — PASS

`packages/auth/src/secureStore.ts` stores access/refresh tokens under
separate `expo-secure-store` keys (Keychain on iOS,
`EncryptedSharedPreferences` on Android) — never a plaintext or
`@workspace/storage`/MMKV-backed value. `session.ts` keeps only an
in-memory cache for synchronous reads (needed by the API client's
per-request header injection); the source of truth is always SecureStore,
populated via `restoreSession()`.

### 2. Logging — PASS

Repo-wide grep for `console.log`/`.warn`/`.error`/`.debug`/`.info` across
`apps/`/`packages/` (excluding tests) found exactly one call:
`packages/analytics/src/consoleAnalyticsClient.ts`, an explicitly dev-only
debug client whose own README already warns never to pass PII through it.
No other `console.*` call exists anywhere in shipped code.

### 3. Error reporting — RISK (documented, not fixed)

No error-reporting/crash-reporting SDK (Sentry, Bugsnag, etc.) is
integrated anywhere in the repo — there is nothing to audit for _active_
leakage today. But `packages/api/src/errors.ts`'s `ApiError` wraps the
original `AxiosError` as `Error.cause`, and that `AxiosError` includes
`error.config.headers` — which, after `attachAuthInterceptor` runs,
contains the live `Authorization: Bearer <accessToken>` header. **Nothing
sends this anywhere today**, but the moment a future phase wires up
`Sentry.captureException(apiError)` (or any tool that serializes `.cause`)
without first stripping `config.headers`, the access token would leak to a
third-party service.

**Recommendation** for whoever adds error reporting: strip
`Authorization`/`Cookie`/any auth headers from `error.cause.config.headers`
before handing an `ApiError` to a third-party reporter, or scrub headers in
the reporter's own `beforeSend` hook. Not fixed here since no
error-reporting integration exists yet to fix it _in_ — this finding
exists precisely so it isn't discovered the hard way later.

### 4. Environment variables — PASS, with a related gap noted

Exactly one `EXPO_PUBLIC_*` variable exists (`EXPO_PUBLIC_API_URL`,
`apps/app-one/src/config/env.ts`) and it's a base URL, not a secret —
satisfies §24's "never put actual secrets in `EXPO_PUBLIC_*`". No `.env`
file is present anywhere in the repo, and both the root and
`apps/app-one` `.gitignore` correctly exclude `.env`/`.env.*`/`.env*.local`.

Related gap: `env.ts`'s own comment defers "the full per-environment
strategy (staging/prod config, secrets handling)" to a phase that was
never scheduled in this repo's actual phase list
(`docs/02_phased_implementation_plan.md` has no dedicated Environment
Strategy phase) — §24's full checklist (feature flags, per-environment
analytics config, environment-specific bundle IDs, EAS channels beyond
what Phase 15 set up) is only partially addressed. Not a vulnerability,
but flagged so it isn't mistaken for "done."

### 5. API keys — PASS

Grepped for common hardcoded-secret patterns (`api_key`, `secret_key`,
`private_key`, `access_key` followed by a long literal) across all source
and config files — zero matches.

### 6. Secrets — PASS

`.github/workflows/*.disable` (renamed from `.yml`, see Phases 14/15)
reference `EXPO_TOKEN` exclusively via `${{ secrets.EXPO_TOKEN }}` — never
hardcoded. `app.json`'s `extra.eas.projectId`/`updates.url` are
`REPLACE_WITH_EAS_PROJECT_ID` placeholders (Phase 15), not real values
that could leak anything.

### 7. Deep links — PASS, with an architectural note

`app.json` declares one custom scheme (`appone`); there is no hand-written
deep-link URL parsing anywhere in the app — all routing is expo-router's
declarative file-based routing, so there's no custom string-parsing code
that could be an injection vector.

Note: `_layout.tsx`'s `Stack.Protected guard={...}` is a **client-side UX
gate only** — it stops a protected screen from being registered in the
navigator while unauthenticated (including via a direct deep link into a
protected path), but it is not, and must never be treated as, the real
authorization boundary. That boundary is `@workspace/api`'s auth
interceptor requiring a valid `Authorization` header on every request —
enforced server-side, which is outside this blueprint's scope (no real
backend exists yet; see item 3 and the `authApi.ts` note below).

### 8. URL schemes — PASS

Same scheme (`appone`) covered under item 7; nothing else registers or
handles a custom URL scheme.

### 9. Debug logs — PASS

No `__DEV__`-gated (or unconditional) debug logging exists anywhere in the
repo — there was nothing found that would need gating.

### 10. Sensitive analytics — PASS by design

`@workspace/analytics` (Phase 16) defaults to `noopAnalyticsClient` (sends
nothing anywhere) and its README explicitly warns against passing names,
emails, phone numbers, or other PII as event properties or `identify()`
traits, per DPDP 2023 data-minimization practice. No call site in
`app-one` currently invokes any analytics method (the package isn't wired
in yet), so there is nothing to leak today.

### 11. Clipboard usage — PASS

Grepped for `expo-clipboard`/`Clipboard.` across the repo — no usage
exists anywhere.

### 12. Screenshots (sensitive screens) — N/A, documented follow-up

No screen in the app currently displays genuinely sensitive data (the
password field uses `secureTextEntry`, so it's masked on-screen too; there
is no card-number, government-ID, or raw-token display anywhere). No
`expo-screen-capture` integration exists, and none is needed yet.

**Follow-up:** if a future screen displays sensitive data (e.g., a full
payment card number, a QR code carrying a session credential), add
`preventScreenCaptureAsync()` (and, on Android, consider `FLAG_SECURE`)
scoped to that screen only — do not apply it app-wide speculatively.

## "Never log" list — explicit grep confirmation

Searched for `accessToken`, `refreshToken`, `password`, and `authorization`
within two lines of any `console.*` call, repo-wide: **zero matches.** The
one `console.log` call that exists (`consoleAnalyticsClient.ts`) logs
whatever the caller passes as event properties, which is the same surface
the analytics README's PII warning already covers — no additional
enforcement exists at the logging layer itself (see Recommendations).

## Production builds disable sensitive debugging — PASS

Redux DevTools (`@workspace/store/src/store.ts`) are gated behind
`process.env.NODE_ENV !== "production"`. No other debug-only tooling (a
debug menu, a verbose network logger, etc.) exists anywhere in the repo
that would need similar gating.

## Additional findings surfaced during this audit (outside the strict §23 list)

- **Hardcoded demo credentials in mock/test fixtures.**
  `apps/app-one/src/features/auth/api/authApi.ts` (the
  explicitly-documented placeholder backend — no real backend exists yet)
  and `apps/app-one/.maestro/login.yaml` (the Phase 13 E2E flow) both use
  the same fixed `demo@example.com` / `password123` pair. This is not a
  real vulnerability today — there is no real account or real data behind
  it — but it must not be mistaken for real credentials, and both must be
  replaced together once a real backend exists (the plan's Phase 10
  "Known risks" already documents `authApi.ts`'s placeholder status; this
  review extends that same caveat to the Maestro flow, which was not
  previously called out).
- **`expo-secure-store` uses default accessibility settings.** Neither
  `getAccessToken`/`setTokens` in `secureStore.ts` configures
  `keychainAccessible`/`requireAuthentication` options. The defaults are
  already OS-level encrypted storage (not a vulnerability), but a team
  wanting stronger guarantees (e.g., biometric-gated access to the refresh
  token) could opt into SecureStore's `requireAuthentication` option later
  — noted as a possible hardening step, not a required fix.

## Recommendations (not implemented — audit is documentation-only per this phase's scope)

1. When error reporting (Sentry or similar) is eventually added, scrub
   `Authorization`/auth-related headers from any
   `ApiError.cause`/`AxiosError.config` before it reaches a third-party
   service.
2. If a dedicated Environment Strategy phase is ever scheduled, close the
   gap `env.ts`'s comment already flags (per-environment feature flags,
   analytics config, bundle identifiers).
3. Replace the shared demo-credential pair in both `authApi.ts` and
   `login.yaml` once a real backend exists, in the same change.

## Exit criteria check

Every §23 checklist item above carries an explicit pass/fail/N-A/risk
status per this phase's exit criteria. No code changes were required —
every finding is either already mitigated by existing design (SecureStore,
the noop analytics default, DI-based testability) or a documented,
not-yet-exploitable latent risk with a concrete recommendation for when
the relevant feature (error reporting, a real backend) is eventually
built.
