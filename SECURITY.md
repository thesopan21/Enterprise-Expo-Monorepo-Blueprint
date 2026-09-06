# Security

This document summarizes the security posture established across this
build. For the full item-by-item audit, see
[`docs/security-review-findings.md`](./docs/security-review-findings.md)
(Phase 19, checked against `01_plan_prompt.md` §23).

## Token storage

Access/refresh tokens live in `expo-secure-store` only (Keychain on iOS,
`EncryptedSharedPreferences` on Android) — never in `@workspace/storage`
(MMKV) or plain state. See `packages/auth/src/secureStore.ts` and ADR-005.

## Never log

```text
accessToken
refreshToken
password
authorization headers
sensitive personal data
```

Confirmed via repo-wide grep (Phase 19): the only `console.*` call anywhere
in shipped code is `@workspace/analytics`'s dev-only `consoleAnalyticsClient`,
whose own README warns against passing PII through it.

## Reporting a vulnerability

This is a private, internal TruScholar blueprint repository. Report a
suspected vulnerability directly to the repository owner rather than
opening a public issue.

## Known, currently-inert risks (see the full findings doc for detail)

- **Error reporting:** no crash/error-reporting SDK is integrated yet, so
  there's nothing to leak through today — but `ApiError.cause` retains the
  raw `AxiosError`, which includes the live `Authorization` header in
  `config.headers`. **Before adding Sentry or similar**, strip
  `Authorization`/`Cookie`/auth headers from that `cause` chain first.
- **Mock credentials:** `apps/app-one/src/features/auth/api/authApi.ts` and
  `apps/app-one/.maestro/login.yaml` share a fixed `demo@example.com` /
  `password123` pair. No real account or data exists behind it — replace
  both together once a real backend exists, so they don't get mistaken for
  real credentials.

## Environment variables and secrets

- `EXPO_PUBLIC_*` variables are bundled into the client and are effectively
  public — never put a real secret in one. Only `EXPO_PUBLIC_API_URL`
  currently exists, and it's a base URL, not a secret.
- CI/CD secrets (`EXPO_TOKEN`) are referenced exclusively via GitHub
  Actions' `secrets` context — never hardcoded. See `DEPLOYMENT.md`.

## Data minimization (DPDP 2023)

`@workspace/analytics`'s README explicitly warns against passing names,
emails, phone numbers, or other PII as event properties or `identify()`
traits — use an opaque internal user ID and non-identifying event metadata
only.

## Dependency supply chain

Every native module dependency is installed via `expo install` (or its
version cross-checked against `apps/app-one`'s already-resolved version)
rather than an arbitrary version pin, keeping the tree aligned with what
Expo SDK 57 actually supports.
