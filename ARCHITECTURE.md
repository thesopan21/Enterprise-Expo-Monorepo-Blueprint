# Architecture

## Monorepo shape

pnpm workspaces + Turborepo (ADR-001). `apps/*` are real, runnable apps;
`packages/*` are shared libraries nothing outside this repo installs
directly. Every package has its own `package.json`, `tsconfig.json`
(extending `@workspace/config`'s shared base), and, where relevant, its own
`jest.config.cjs`/`eslint.config.mjs`.

## Package graph

```text
apps/app-one
  depends on: @workspace/{api,auth,hooks,theme,ui,utils}, @workspace/config (dev)
  optionally wireable (not currently adopted): @workspace/{store,analytics,notifications,i18n}

@workspace/ui        -> @workspace/theme
@workspace/api        -> @workspace/auth (types only: TokenProvider contract)
@workspace/store      -> @workspace/api (via axiosBaseQuery, app supplies the axios instance)
@workspace/i18n       -> @workspace/storage (Storage interface, injected)
@workspace/analytics, @workspace/notifications -> (no @workspace/* dependency; self-contained)
@workspace/theme, @workspace/storage, @workspace/auth, @workspace/hooks, @workspace/utils
  -> (no @workspace/* dependency; foundational)
@workspace/config
  -> consumed by every package's tsconfig/eslint/jest, itself depends on nothing in-repo
```

**Rule (ADR-003):** dependencies point one way. A package never depends on
an app. A package with an optional integration point (e.g. `@workspace/
analytics`'s `identify()`/`reset()` on sign-in/out) documents that
integration in its own README rather than depending on `@workspace/auth`
to call it automatically — the app decides when to call it.

## Native modules: peer, not bundled

Any package importing a real native module (`expo-router`, `expo-image`,
`expo-notifications`, `expo-localization`, `react-native`) declares it as a
**peer** dependency, with a matching `devDependency` pin for local
typechecking/testing. The app supplies the actual installed version — this
is what keeps the whole tree on exactly one `react`/`react-native` version
(§40's "no duplicate React/React Native versions" check), verified via
`grep -oE "^  react@[0-9.]+" pnpm-lock.yaml | sort -u`.

Pure-JS dependencies a package fully owns (`i18next`, `@reduxjs/toolkit`,
`axios`) are regular `dependencies` — the package, not the app, picks the
vendor.

## Server-state: two supported patterns (ADR-004)

- **Pattern A (`app-one`'s current choice):** `@tanstack/react-query` on top
  of `@workspace/api`'s Axios client.
- **Pattern B (available, unused):** `@workspace/store`'s RTK Query on top
  of the _same_ Axios client via `axiosBaseQuery`.

Both patterns share one HTTP client and one auth/refresh interceptor pair —
switching patterns changes only which provider wraps the app root and which
package owns server-state hooks in `src/features/*`.

## Auth flow

1. `packages/auth/src/secureStore.ts` — the only place `expo-secure-store`
   is imported directly.
2. `packages/auth/src/session.ts`'s `createSessionManager(adapter)` takes
   that adapter by required injection, keeping an in-memory token cache for
   synchronous reads.
3. `packages/api/src/interceptors/auth.ts` reads the current access token
   synchronously on every outgoing request.
4. `packages/api/src/interceptors/refresh.ts` handles a 401 with a
   single-flight refresh (ADR-007) — concurrent 401s share one refresh call.
5. `apps/app-one/src/providers/SessionProvider.tsx` is the only React-level
   consumer; `Stack.Protected guard={...}` in the root layout is a
   client-side UX gate on top of this, not the real authorization boundary
   (that's server-side, per `docs/security-review-findings.md`).

## Design system (ADR-006)

`@workspace/theme`'s typed tokens, consumed via `StyleSheet.create()` —
no NativeWind/styled-components. `theme.colors.dark` tokens exist but no
component currently reads a color-scheme signal to switch to them — a real,
open gap, not a decision (see `docs/final-architecture-audit.md`).

## CI/CD and native builds (ADR-002, ADR-008)

`ios/`/`android/` are gitignored and regenerated via `expo prebuild`
(Continuous Native Generation) — never hand-edited. Real EAS-driven and
local native builds are described in `DEPLOYMENT.md`.

## Key architectural decisions

See [`docs/adr/`](./docs/adr/) for the full Context/Decision/Alternatives/
Consequences behind each of the following:

- [ADR-001](./docs/adr/ADR-001-pnpm-turborepo.md) — pnpm + Turborepo
- [ADR-002](./docs/adr/ADR-002-expo-cng.md) — Expo CNG
- [ADR-003](./docs/adr/ADR-003-package-boundaries.md) — Package boundaries
- [ADR-004](./docs/adr/ADR-004-axios-tanstack-query.md) — Axios + TanStack Query
- [ADR-005](./docs/adr/ADR-005-securestore-mmkv.md) — SecureStore + MMKV
- [ADR-006](./docs/adr/ADR-006-stylesheet-design-system.md) — StyleSheet design system
- [ADR-007](./docs/adr/ADR-007-auth-token-refresh.md) — Authentication/token refresh
- [ADR-008](./docs/adr/ADR-008-cicd-architecture.md) — CI/CD architecture
