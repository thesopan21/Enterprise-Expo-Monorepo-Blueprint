# Phased Implementation Plan — Phases 3–21

Status: **Planning document only — no implementation in this document.**
Date: 2026-08-23 (Phase 11 — `@workspace/store` — inserted 2026-09-06; Phase 15 — OTA Updates, Phases 16–17 — `@workspace/analytics`, `@workspace/notifications`, Phase 18 — `@workspace/i18n` — inserted 2026-09-06; see Cross-Phase Notes for the resulting numbering offset against `01_plan_prompt.md`)

This is the required per-phase breakdown (§34 of `01_plan_prompt.md`): every phase carries Objective, Inputs, Changes, Files created, Files modified, Dependencies, Validation, Tests, Known risks, Rollback strategy, and Exit criteria. Phases 0–2 are already implemented and validated — see `00_phase0_discovery.md` and the chat report for their results. Nothing below has been built yet; each phase starts only once the prior one is reviewed and approved.

Reference: package dependency graph and risk register from Phase 0 still apply and are not repeated per-phase except where a phase adds a new risk.

---

## Phase 3 — `@workspace/config`

**Objective:** Centralize TypeScript, ESLint, and Prettier configuration into one shared package, replacing the leftover `@repo/eslint-config` and `@repo/typescript-config`.

**Inputs:** Existing `packages/eslint-config`, `packages/typescript-config` (untouched since Phase 1); Expo SDK 57's own `expo/tsconfig.base`; each app's current standalone `tsconfig.json`.

**Changes:**

- Merge `eslint-config` + `typescript-config` into a single `packages/config` package (per spec §12, one package, not two).
- Provide `tsconfig.base.json` (framework-agnostic strict TS) and `tsconfig.expo.json` (extends Expo's own base, for apps).
- Provide a flat ESLint config (`eslint.config.mjs`) covering TS + React Native + import-order rules, split into a base ruleset and an Expo/React Native overlay.
- Provide a shared `prettier.config.js`.
- Repoint each app's `tsconfig.json` to `extends: "@workspace/config/tsconfig.expo.json"`.
- Add root `tsconfig.json` project references to every package/app once each has its own `tsconfig.json`.

**Files created:**

```
packages/config/package.json
packages/config/tsconfig.base.json
packages/config/tsconfig.expo.json
packages/config/eslint.config.mjs
packages/config/eslint.expo.mjs
packages/config/prettier.config.js
```

**Files modified:**

```
apps/app-one/tsconfig.json
tsconfig.json (root — add references)
```

Files removed: `packages/eslint-config/**`, `packages/typescript-config/**` (superseded).

**Dependencies added:** `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-expo` (Expo's official flat config base, if compatible with SDK 57), `prettier`.

**Validation:** `pnpm lint` and `pnpm typecheck` from root succeed for app-one; `tsc --noEmit` resolves the shared base without path errors; ESLint reports zero unexpected errors on the freshly generated app-one source.

**Tests:** N/A (config package — validated by consuming packages passing lint/typecheck, not unit tests).

**Known risks:** Expo's official ESLint flat config may not yet be compatible with ESLint 9's config shape used by the old `@repo/eslint-config`; version mismatch would require picking one lineage explicitly rather than merging blindly.

**Rollback:** Revert to the per-app default `tsconfig.json`/no shared ESLint (i.e., keep Phase 1/2 state); no other phase depends on `@workspace/config` internals beyond import paths, so rollback is isolated.

**Exit criteria:** `pnpm lint`, `pnpm typecheck` clean from repo root; no app has a local, duplicated ESLint/TS config.

---

## Phase 4 — `@workspace/theme`

**Objective:** Centralized design tokens (colors, spacing, typography, font weights, radius, shadows, breakpoints, elevation/z-index) as a pure, dependency-free package.

**Inputs:** None (net-new); informs Phase 5 (`ui`) token consumption.

**Changes:** New package exporting a typed token object plus light/dark palettes. React Native `StyleSheet`-oriented (no NativeWind).

**Files created:**

```
packages/theme/package.json
packages/theme/src/index.ts
packages/theme/src/colors.ts
packages/theme/src/spacing.ts
packages/theme/src/typography.ts
packages/theme/src/radius.ts
packages/theme/src/shadows.ts
packages/theme/src/elevation.ts
```

**Files modified:** none outside `packages/theme`.

**Dependencies added:** none beyond `@workspace/config` (dev-only, for tsconfig/eslint).

**Validation:** `pnpm --filter @workspace/theme typecheck`; import `{ theme }` from a throwaway snippet in one app to confirm resolution (`import { colors } from '@workspace/theme'`), then remove the snippet.

**Tests:** Unit tests asserting token shape (e.g., every color has a value, spacing scale is monotonic) — lightweight, via the test runner chosen in Phase 13 groundwork (Jest config introduced here just for this package, formalized repo-wide in Phase 13).

**Known risks:** Low — no native/runtime dependencies.

**Rollback:** Delete `packages/theme`; nothing else exists yet to depend on it at this point in the sequence.

**Exit criteria:** Package builds/typechecks; importable from an app via `@workspace/theme`, not a relative path.

---

## Phase 5 — `@workspace/ui`

**Objective:** Atomic, theme-driven, business-logic-free UI component library: `Button`, `Input`, `Card`, `Typography`, `IconButton`, `Divider`, `Avatar`, `Badge`, `Loader`, `EmptyState`, `ErrorState`, `Modal`, and a `BottomSheet` abstraction if a suitable dependency is vetted.

**Inputs:** `@workspace/theme` (Phase 4).

**Changes:** New package; every component typed, accessible (`accessibilityRole`/`accessibilityLabel`/`accessibilityState`), with disabled/loading states where relevant, styled via `StyleSheet` and theme tokens only — no API or navigation imports.

**Files created:**

```
packages/ui/package.json
packages/ui/src/index.ts
packages/ui/src/Button/Button.tsx (+ .test.tsx)
packages/ui/src/Input/Input.tsx (+ .test.tsx)
packages/ui/src/Card/Card.tsx
packages/ui/src/Typography/Typography.tsx
packages/ui/src/IconButton/IconButton.tsx
packages/ui/src/Divider/Divider.tsx
packages/ui/src/Avatar/Avatar.tsx
packages/ui/src/Badge/Badge.tsx
packages/ui/src/Loader/Loader.tsx
packages/ui/src/EmptyState/EmptyState.tsx
packages/ui/src/ErrorState/ErrorState.tsx
packages/ui/src/Modal/Modal.tsx
packages/ui/src/BottomSheet/BottomSheet.tsx   (only if a New-Architecture-compatible dependency, e.g. @gorhom/bottom-sheet, checks out in Phase 5 dependency vetting)
```

**Files modified:** none outside `packages/ui`.

**Dependencies added:** `react-native-svg` or icon set (for `IconButton`/`Avatar` fallback) — vetted for New Architecture/Expo Go compatibility before adding; `@gorhom/bottom-sheet` only if `BottomSheet` is included (requires `react-native-reanimated`, already present via the app template — needs a Development Build, not Expo Go, once added).

**Validation:** `pnpm --filter @workspace/ui typecheck`; render each component in one app's screen temporarily via `expo start --web` to visually confirm no crashes; remove the temporary screen after.

**Tests:** Component tests (React Native Testing Library) for interactive components (`Button` press states, `Input` value/onChange, `Modal` open/close) — introduced here, formalized in Phase 13.

**Known risks:** `BottomSheet` dependency requires a Development Build even in `Expo Go`-friendly early testing — flag clearly in package README so app teams aren't surprised later (Phase 12 native validation is where this actually gets exercised).

**Rollback:** Ship without `BottomSheet` first (defer to a later minor addition) if the dependency check fails; the rest of the component set has no such constraint.

**Exit criteria:** All listed components implemented, typed, accessible, importable as `@workspace/ui`, and pass component tests.

---

## Phase 6 — `@workspace/storage`

**Objective:** MMKV-backed key-value storage for non-sensitive local/persistent data, with a documented, honest dev/test fallback.

**Inputs:** MMKV v4 (NitroModules-based) — confirmed New Architecture compatible; **not supported in Expo Go**, requires a Development Build (Phase 0 discovery).

**Changes:** Storage interface (`get`/`set`/`delete`/`clear`, typed) backed by `react-native-mmkv` in native builds; an in-memory fallback used only in Jest/unit-test environments and explicitly documented as non-persistent (never presented as a production substitute).

**Files created:**

```
packages/storage/package.json
packages/storage/src/index.ts
packages/storage/src/mmkvStorage.ts
packages/storage/src/memoryStorage.ts        (test/dev fallback, clearly labeled non-persistent)
packages/storage/src/types.ts
packages/storage/README.md                    (documents fallback limitations explicitly)
```

**Dependencies added:** `react-native-mmkv` (v4.x) + peer `react-native-nitro-modules`.

**Validation:** `pnpm --filter @workspace/storage typecheck`; a Development Build smoke test in Phase 12 (native validation) is the real proof — this phase alone cannot validate native MMKV behavior in Expo Go.

**Tests:** Unit tests against the memory fallback (interface contract only); native MMKV behavior is exercised in Phase 12, not here, since it requires a Development Build.

**Known risks:** Team continuing to use `expo start` (Expo Go) without a Development Build will silently hit "module not found" for MMKV — mitigated by failing loudly with a clear error message from the storage package rather than a cryptic native crash, plus README callout.

**Rollback:** Fall back to `@react-native-async-storage/async-storage` if MMKV/NitroModules prove incompatible with SDK 57 during Phase 12 — documented as a contingency, not the default plan.

**Exit criteria:** Interface typed and exported as `@workspace/storage`; fallback behavior unit-tested; native behavior deferred to and tracked in Phase 12.

---

## Phase 7 — `@workspace/auth`

**Objective:** Authentication session lifecycle — login/logout, JWT decode, access/refresh token handling, SecureStore-backed persistence, session restoration on app start.

**Inputs:** `expo-secure-store` (bundled with SDK 57); `@workspace/storage` (Phase 6, for non-sensitive session metadata only, never tokens).

**Changes:** Session manager exposing an interface (`getAccessToken`, `getRefreshToken`, `setSession`, `clearSession`, `onSessionChange`) designed so `@workspace/api` (Phase 8) consumes it by dependency inversion — no direct `auth → api` or `api → auth` circular import.

**Files created:**

```
packages/auth/package.json
packages/auth/src/index.ts
packages/auth/src/secureStore.ts
packages/auth/src/session.ts
packages/auth/src/jwt.ts                     (decode-only, no verification — server is source of truth)
packages/auth/src/types.ts
```

**Dependencies added:** `expo-secure-store` (already ships with SDK 57 apps, added explicitly here as a package-level dependency); a lightweight JWT decode library (no server-side verification logic in-app).

**Validation:** `pnpm --filter @workspace/auth typecheck`; SecureStore behavior validated on a real Development Build in Phase 12 (SecureStore has no meaningful web/simulator-only substitute for production behavior — document this limitation explicitly, do not fake it).

**Tests:** Unit tests for JWT decode edge cases (malformed token, expired `exp` claim) and session state transitions, using a mocked SecureStore adapter.

**Known risks:** Circular dependency temptation between `auth` and `api` (refresh calls need the API client; API client needs tokens from auth) — resolved via an injected `TokenProvider` interface owned by `auth`, consumed by `api`, not the reverse.

**Rollback:** N/A — no prior phase depends on `auth` yet.

**Exit criteria:** Session lifecycle fully typed and unit-tested; zero import cycle with `api` (enforced by an ESLint import-cycle rule from `@workspace/config`, Phase 3).

---

## Phase 8 — `@workspace/api`

**Objective:** Axios-based HTTP client with base URL config, interceptors, JWT-aware auth headers, single-flight refresh-on-401 with concurrent-request protection, normalized error model, timeout, and network-error handling.

**Inputs:** `@workspace/auth`'s `TokenProvider` interface (Phase 7) — consumed, not imported circularly.

**Changes:**

- Axios instance factory with interceptors for auth header injection and error normalization.
- 401 handling: on first 401, trigger one refresh; concurrent requests that 401 while a refresh is in-flight queue and retry after it resolves, rather than each triggering their own refresh call.
- On refresh failure: clear session via the injected `TokenProvider.clearSession()`, propagate a normalized `SESSION_EXPIRED` error for the app shell to react to (logout/redirect), per §20/§21.
- Normalized `ApiError` type (`NETWORK`, `TIMEOUT`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION`, `RATE_LIMITED`, `SERVER`, `UNKNOWN`) so UI never touches raw Axios errors.

**Files created:**

```
packages/api/package.json
packages/api/src/index.ts
packages/api/src/client.ts
packages/api/src/interceptors/auth.ts
packages/api/src/interceptors/refresh.ts       (single-flight refresh queue)
packages/api/src/errors.ts                     (normalization + ApiError type)
packages/api/src/types.ts
```

**Dependencies added:** `axios`.

**Validation:** `pnpm --filter @workspace/api typecheck`.

**Tests:** This package carries the highest correctness bar per §28 ("at minimum test... token refresh"). Unit tests (mocked Axios via `axios-mock-adapter` or MSW): single request 401→refresh→retry; N concurrent requests during one in-flight refresh trigger exactly one refresh call; refresh failure clears session and surfaces `SESSION_EXPIRED`; each normalized error code maps correctly from representative Axios/network failures (timeout, ECONNABORTED, no network, 4xx/5xx family).

**Known risks:** Getting single-flight refresh wrong (either duplicate refresh calls or a stuck queue on refresh failure) is the highest-impact bug class in this whole package graph — mitigated entirely through the test list above before this phase is considered done.

**Rollback:** N/A — first consumer (apps' data layer) isn't wired until Phase 10.

**Exit criteria:** All refresh/concurrency/error-normalization tests pass; zero `auth`↔`api` circular import (lint-enforced).

---

## Phase 9 — `@workspace/hooks` and `@workspace/utils`

**Objective:** Small, genuinely reusable hook and utility libraries — explicitly scoped to avoid becoming dumping grounds (§8/§9).

**Inputs:** None beyond `@workspace/config`.

**Changes:**

- `hooks`: `useNetworkStatus`, `useDebounce`, `useKeyboard`, `useAppState`, `useIsMounted`, `usePrevious`.
- `utils`: date formatting, currency formatting, validation helpers, string helpers, number helpers, error helpers — framework-independent, minimal dependencies.

**Files created:**

```
packages/hooks/package.json
packages/hooks/src/index.ts
packages/hooks/src/useNetworkStatus.ts (+ .test.ts)
packages/hooks/src/useDebounce.ts (+ .test.ts)
packages/hooks/src/useKeyboard.ts
packages/hooks/src/useAppState.ts
packages/hooks/src/useIsMounted.ts
packages/hooks/src/usePrevious.ts

packages/utils/package.json
packages/utils/src/index.ts
packages/utils/src/date.ts (+ .test.ts)
packages/utils/src/currency.ts (+ .test.ts)
packages/utils/src/validation.ts (+ .test.ts)
packages/utils/src/string.ts (+ .test.ts)
packages/utils/src/number.ts (+ .test.ts)
packages/utils/src/error.ts (+ .test.ts)
```

**Dependencies added:** `@react-native-community/netinfo` (for `useNetworkStatus` — vetted for New Architecture/Expo SDK 57 compatibility first); a date library only if native `Intl`/`Date` formatting proves insufficient (prefer zero-dependency).

**Validation:** `pnpm --filter @workspace/hooks --filter @workspace/utils typecheck`.

**Tests:** Full unit coverage on `utils` (pure functions — easy, high-value); hook tests via `@testing-library/react-hooks`-equivalent for RN.

**Known risks:** Scope creep — explicit exit criterion below guards against it.

**Rollback:** N/A, additive only.

**Exit criteria:** Only the listed hooks/utils exist (no speculative additions); all have unit tests; `pnpm test` green.

---

## Phase 10 — Application Architecture

**Objective:** Wire the shared packages into each app via feature-oriented structure, Expo Router for navigation only (no business logic in route files), providers, services, and a server-state layer.

**Server-state strategy (developer choice):** This blueprint supports two interchangeable patterns, both consuming `@workspace/api`'s `createApiClient()` as the transport — neither changes anything in `@workspace/api` itself:

- **Pattern A — TanStack Query** (default for app-one): `QueryClientProvider` + manual `useQuery`/`useMutation` hooks per feature calling the shared axios client directly. No global client-state store.
- **Pattern B — Redux Toolkit + RTK Query**: a root store + `createApi()` using a custom `axiosBaseQuery` that wraps the same axios client. Pulls in Redux Toolkit + react-redux as hard dependencies. Built as a ready-to-use package in Phase 11.

A team scaffolding a new app from this blueprint picks one; a single app only ever runs one pattern at runtime. Nothing in Phases 0–9 depends on this choice.

**Inputs:** All of Phases 3–9.

**Changes (app-one; structure repeats identically if/when additional apps are added later):**

- `src/app/` — Expo Router route files, thin, delegate to `features/*/screens`.
- `src/features/<feature>/{api,components,hooks,screens,types.ts,validation.ts}` — starting with an `auth` feature (login/logout screen using `@workspace/auth` + `@workspace/api`) as the reference implementation other features copy.
- `src/providers/` — server-state provider (`QueryClientProvider` for Pattern A, or `<Provider store={...}>` for Pattern B), auth session provider, theme provider.
- `src/services/` — app-level service wiring (e.g., the concrete Axios client instance configured with this app's base URL, injected into `@workspace/api`'s factory).
- `src/config/`, `src/constants/` — per-app environment-driven config (ties into Phase 24's environment strategy, not duplicated here).

**Files created:** New `src/` tree per app (structure above); each app's root layout (`src/app/_layout.tsx`) wraps providers.

**Files modified:** Each app's `package.json` (add `@workspace/*` and the chosen server-state pattern's dependencies), existing template route files replaced by the feature-oriented structure.

**Dependencies added:** Pattern A: `@tanstack/react-query` (per app, or hoisted at workspace root if version-pinned identically across apps). Pattern B: `@workspace/store` (Phase 11), which itself carries `@reduxjs/toolkit` + `react-redux`.

**Validation:** `expo export --platform web` per app succeeds against the new structure (as already proven possible in Phase 2); manual login-flow walkthrough once a real or mock API endpoint is available.

**Tests:** Integration test for the auth feature (login → token stored → protected route accessible → logout → token cleared), using the mocked API client from Phase 8's test harness.

**Known risks:** Without a real backend, the login flow can only be validated against a mock; document this explicitly rather than claiming full integration coverage.

**Rollback:** Per-feature — each feature folder is independent; a broken feature doesn't block the others since Expo Router routes are isolated files.

**Exit criteria:** At least the `auth` feature fully wired end-to-end (mocked backend) in app-one; route files contain no business logic; the chosen server-state pattern owns all server state.

---

## Phase 11 — `@workspace/store` (Redux Toolkit + RTK Query)

**Objective:** A production-grade Redux Toolkit + RTK Query package — Pattern B of Phase 10's server-state choice — built now as a ready-to-use package for any future app that prefers Redux over TanStack Query, not wired into app-one by default.

**Inputs:** `@workspace/api`'s `createApiClient()` (Phase 8) as the transport that RTK Query's `axiosBaseQuery` wraps — this package never creates its own HTTP client. `@workspace/auth`'s `TokenProvider` (Phase 7) is consumed indirectly, only through whichever `@workspace/api` client instance an app injects; `@workspace/store` itself has no auth/token-handling logic of its own.

**Changes:**

- `configureStore` factory producing a typed `RootState`/`AppDispatch`, plus typed `useAppDispatch`/`useAppSelector` hooks (per Redux Toolkit's own recommended pattern — no untyped `useDispatch`/`useSelector` usage anywhere downstream).
- A custom `axiosBaseQuery` adapter so `createApi()` endpoints route through an app-supplied `AxiosInstance` (i.e. the same instance `@workspace/api`'s `createApiClient()` produces) instead of RTK Query's default `fetchBaseQuery` — preserving Phase 8's auth-header injection, single-flight refresh, and `ApiError` normalization untouched.
- One reference `createApi()` slice with a placeholder query, a placeholder mutation, and tag-based cache invalidation between them — a template for consuming apps to copy and replace with real endpoints, not a real feature.
- Redux DevTools enabled in development builds only (`__DEV__`-gated), disabled in production.
- A documented, optional integration point for `redux-persist` (not force-enabled) for apps that want Redux-level cache persistence beyond what `@workspace/storage`/`@workspace/auth` already provide.

**Files created:**

```
packages/store/package.json
packages/store/src/index.ts
packages/store/src/store.ts                  (configureStore, RootState, AppDispatch)
packages/store/src/hooks.ts                  (typed useAppDispatch/useAppSelector)
packages/store/src/axiosBaseQuery.ts         (RTK Query <-> @workspace/api adapter)
packages/store/src/api/exampleApi.ts         (reference createApi() slice — query + mutation + tag invalidation)
packages/store/README.md                     (wiring into an app's root Provider; replacing the example slice; how this coexists with/replaces Phase 10's TanStack Query default)
```

**Files modified:** none outside `packages/store` — app-one stays on Pattern A (TanStack Query) and does not import this package.

**Dependencies added:** `@reduxjs/toolkit`, `react-redux`.

**Validation:** `pnpm --filter @workspace/store typecheck`; a throwaway `<Provider store={store}>` + one `useExampleQuery()` call wired into one app (mirroring how Phases 4–9 validated bundler resolution), confirming the axios adapter round-trips through `@workspace/api`'s interceptors (auth header present, a forced 401 triggers the same single-flight refresh as Phase 8's own tests), then remove the snippet.

**Tests:** Unit tests for `axiosBaseQuery` — a successful Axios response maps to RTK Query's `{ data }` shape; an `ApiError` (Phase 8) maps to `{ error }` with its `code`/`status` preserved, not a raw Axios error. A store-level test proving the example slice's tag invalidation actually triggers a refetch after its mutation succeeds (the same class of correctness bar Phase 8 set for its own cache/retry logic).

**Known risks:** This package is not consumed by app-one, so its own unit tests and the throwaway wiring check in Validation are the only proof it works until a real app adopts Pattern B — keep the example slice deliberately trivial so it doesn't rot into an unmaintained fake feature. Redux Toolkit + react-redux add real bundle weight (relevant to Phase 20's performance review); a team must consciously add this package, never receive it as a transitive default.

**Rollback:** Delete `packages/store`; Phase 10's app-one wiring has zero dependency on it (TanStack Query is fully self-contained), so rollback is isolated and risk-free to the rest of the graph.

**Exit criteria:** `axiosBaseQuery` unit-tested against both success and `ApiError` cases; the example slice's tag-invalidation test passes; package typechecks/lints clean; README documents how a future app switches from Pattern A to Pattern B using this package.

---

## Phase 12 — Native / CNG Validation

**Objective:** Prove the whole dependency graph (MMKV/NitroModules, SecureStore, any UI native deps like BottomSheet) actually builds and runs as native code, not just typechecks.

**Inputs:** All shared packages consumed by at least one app (post-Phase 10).

**Changes:** No new source files — this phase runs `expo prebuild` and produces Development Builds.

**Commands:**

```
pnpm --filter @workspace/app-one exec expo prebuild --clean
pnpm --filter @workspace/app-one exec expo run:ios      (requires macOS + Xcode)
pnpm --filter @workspace/app-one exec expo run:android  (requires Android SDK)
```

**Files created:** `apps/app-one/ios/`, `apps/app-one/android/` (generated, gitignored per Phase 1's `.gitignore` — CNG regenerates them, not hand-maintained).

**Dependencies added:** none new; this phase validates what Phases 6/7/8 already added.

**Validation:** App launches on iOS Simulator and Android Emulator; MMKV read/write round-trips; SecureStore persists across app restarts; login flow (Phase 10) works on-device, not just in Metro web export.

**Tests:** Manual smoke test checklist (documented, not automated) — automated E2E is Phase 13's responsibility, not this one.

**Known risks:** This is the phase most likely to surface real incompatibilities (NitroModules build errors, config-plugin conflicts) that couldn't be caught by typecheck/lint alone — **this environment cannot execute `expo run:ios`/`run:android` directly** (no macOS/Xcode or Android SDK confirmed available here), so this phase's native execution must happen on a machine with those toolchains, or via `eas build --profile development`.

**Rollback:** If MMKV/NitroModules fail to build, fall back per Phase 6's documented contingency (AsyncStorage) before retrying prebuild.

**Exit criteria:** Clean prebuild + successful Development Build launch on both platforms, with the native-dependent features (storage, auth, any native UI) manually verified working on-device.

---

## Phase 13 — Testing

**Objective:** Formalize the unit/component tests already written ad hoc in Phases 4–11 into one coherent, repo-wide test setup, plus define the E2E strategy.

**Inputs:** Jest usage already implied by earlier phases' "Tests" sections.

**Changes:**

- Root Jest config (`jest.config.base.js` in `@workspace/config`, extended per package/app) using `jest-expo` preset for apps.
- `test` script wired into every package/app `package.json`, orchestrated via `turbo run test`.
- E2E strategy: **Maestro** recommended (YAML-based, no native test-target boilerplate, works well with Expo Development Builds and CI) over Detox (heavier native setup) — one flow (`login.yaml`) as the reference E2E test, not a full suite, per §28's "do not introduce five frameworks" guidance.

**Files created:**

```
packages/config/jest.config.base.js
apps/app-one/.maestro/login.yaml   (reference flow; repeat for additional apps if/when they're added)
```

**Files modified:** every package/app `package.json` (`test` script), `turbo.json` (already has a `test` task from Phase 1 — verify `outputs: ["coverage/**"]` matches actual coverage output path).

**Dependencies added:** `jest`, `jest-expo`, `@testing-library/react-native`, `msw` or `axios-mock-adapter` (already implied by Phase 8).

**Validation:** `pnpm test` from root runs every package's/app's suite via Turbo with correct `dependsOn` caching.

**Tests:** This phase's deliverable _is_ the test infrastructure — validated by all previously-written tests (Phases 4–11) now actually executing under one root command, plus the one Maestro flow running against a Development Build from Phase 12.

**Known risks:** Maestro E2E requires a running simulator/emulator or device — same environment constraint as Phase 12.

**Rollback:** N/A, additive.

**Exit criteria:** `pnpm test` green from root; one working E2E flow proven on at least one platform.

---

## Phase 14 — CI/CD

**Objective:** GitHub Actions for PR validation and main/production EAS builds, per §26.

**Inputs:** All prior phases' `lint`/`typecheck`/`test` scripts; EAS project (not yet created — requires an Expo account/org, a user-side action).

**Changes:**

- `pr.yml`: install (`pnpm install --frozen-lockfile`) → format check → lint → typecheck → test → `expo-doctor` for each app.
- `main.yml`: same gate, then triggers EAS builds on merge to `main`.
- `release.yml`: on tag, EAS production build + submission.

**Files created:**

```
.github/workflows/pr.yml
.github/workflows/main.yml
.github/workflows/release.yml
```

**Files modified:**

```
package.json (root) — added a `format:check` script (`prettier --check`) alongside the
existing write-mode `format` script, so CI can gate on formatting without mutating files.
Running it surfaced 102 already-committed files that were never prettier-formatted;
fixed via a one-time `pnpm format` before wiring the gate in.
```

**Dependencies added:** none (uses `eas-cli` via `npx`/`pnpm dlx` in CI, no repo dependency needed).

**Validation:** Workflow YAML lint (`actionlint` or GitHub's own validator); a draft PR against this repo to confirm `pr.yml` actually runs and passes.

**Tests:** N/A (infrastructure, validated by execution).

**Known risks:** Requires secrets (`EXPO_TOKEN`, EAS project ID) that only the user/org can provision — this phase produces the workflow files, but activating EAS build/submit requires the user to create the EAS project (`eas build:configure`, which generates `apps/app-one/eas.json` with build profiles — not created by this phase) and add the `EXPO_TOKEN` secret in GitHub, which I cannot do on their behalf. `main.yml`'s `eas-build` and `release.yml`'s `eas-release` jobs are gated behind `if: secrets.EXPO_TOKEN != ''` so the workflow stays green (job skipped, not failed) until that setup is done.

**Rollback:** Workflows are additive; disabling is a one-line revert per file.

**Exit criteria:** `pr.yml` green on a real PR; `main.yml`/`release.yml` structurally correct and documented as pending the user's EAS project/secrets setup.

---

## Phase 15 — OTA Updates (`expo-updates` + EAS Update)

**Objective:** Configure `expo-updates` so app-one can receive JavaScript/asset updates over-the-air via EAS Update, without an app-store review cycle for JS-only changes, with a safe rollout/rollback story.

**Inputs:** Phase 12's native build config (prebuild output, `app.json`); Phase 14's EAS project/`EXPO_TOKEN` (the same EAS account provisions both EAS Build and EAS Update).

**Changes:**

- Add `expo-updates` to app-one's dependencies; configure `app.json`'s `updates` field (`url`, `fallbackToCacheTimeout`) and an explicit `runtimeVersion` policy (`appVersion` or a fingerprint-based policy — pick one and document why, since a mismatched runtime version silently stops an OTA update from ever applying, with no error).
- Define update **channels** (e.g. `production`, `staging`) mapped to EAS Update branches, so a build installed from a given channel only ever receives updates published to that same channel.
- A minimal in-app update check (`Updates.checkForUpdateAsync()` / `Updates.fetchUpdateAsync()`), or an explicit decision to rely on the default automatic-check-on-launch behavior — document which was chosen and why, rather than silently defaulting.
- Wire an `eas update --branch <channel>` publish step into Phase 14's `main.yml`/`release.yml`, gated behind the same `EXPO_TOKEN` secret.

**Files created/modified:**

```
apps/app-one/app.json          (add "updates", "runtimeVersion" fields)
.github/workflows/main.yml     (modified — add an eas update publish step)
docs/ota-updates.md            (channel/branch strategy, rollback procedure, runtimeVersion policy rationale)
```

**Dependencies added:** `expo-updates`.

**Validation:** `expo-doctor` (already part of Phase 14's `pr.yml` gate) passes with `expo-updates` configured; a Development/production build from Phase 12 actually receives a published test update — the only real proof, and it needs a build installed on a device/simulator plus a real `eas update` publish, the same user-provisioned EAS project dependency Phase 14 already flagged.

**Tests:** N/A — native/EAS configuration, not meaningfully unit-testable; validated by the on-device update check in Validation.

**Known risks:** A `runtimeVersion` mismatch between a build and a published update is a common, silent failure mode (the update is simply never offered) — document the exact policy chosen and why. OTA updates can only ship JS/asset changes; any native module or config-plugin change still requires a full rebuild through Phases 12/14, not an OTA update — state this boundary explicitly so it's never mistaken for a way to skip app-store review universally. Requires the same user-provisioned EAS project/`EXPO_TOKEN` as Phase 14.

**Rollback:** Publish a previous known-good update (or `eas update:rollback`) to the affected channel; disabling `expo-updates` entirely reverts to store-review-only releases — an isolated, additive-only removal.

**Exit criteria:** `app.json`'s `updates`/`runtimeVersion` fields configured and documented; at least one test update successfully received on a Development Build; CI has a gated `eas update` publish step; `docs/ota-updates.md` documents the channel strategy and rollback procedure.

---

## Phase 16 — `@workspace/analytics`

**Objective:** A vendor-agnostic analytics/event-tracking package — a thin interface apps use to log events, screen views, and identify users without coupling feature code to a specific analytics SDK (Segment, PostHog, Firebase Analytics, Amplitude, etc.), since no vendor has been chosen for this blueprint.

**Inputs:** None beyond `@workspace/config`. Optionally consumed by Phase 10's auth feature (`identify()` on sign-in, `reset()` on sign-out) — documented as an integration point, not a required change to Phase 10.

**Changes:**

- `AnalyticsClient` interface: `track(event, properties)`, `screen(name, properties)`, `identify(userId, traits)`, `reset()`.
- `NoopAnalyticsClient` — the default, safe implementation that does nothing; used until a team wires a real vendor.
- `ConsoleAnalyticsClient` — a dev-only implementation that logs calls to the console, useful for verifying instrumentation before a vendor is chosen.
- A real vendor SDK is added by the **consuming app**, implementing the same `AnalyticsClient` interface — never a dependency of this package itself, to avoid pulling in an SDK nobody's using.
- `useScreenTracking` — an optional Expo Router screen-view auto-tracking hook.

**Files created:**

```
packages/analytics/package.json
packages/analytics/src/index.ts
packages/analytics/src/types.ts
packages/analytics/src/noopAnalyticsClient.ts
packages/analytics/src/consoleAnalyticsClient.ts
packages/analytics/src/useScreenTracking.ts
packages/analytics/README.md                  (vendor wiring guide; explicit "do not track PII" guidance)
```

**Dependencies added:** none beyond peer `react`/`react-native` (for the tracking hook); a real vendor SDK is the consuming app's dependency, not this package's.

**Validation:** `pnpm --filter @workspace/analytics typecheck`; a throwaway wiring of `NoopAnalyticsClient` into one app screen (mirroring Phases 4–11's bundler-resolution checks), confirming it resolves and never throws, then remove the snippet.

**Tests:** Unit tests for `NoopAnalyticsClient`/`ConsoleAnalyticsClient` (every interface method is callable and never throws); a test proving `useScreenTracking` calls `.screen()` on each route change, using a mocked client.

**Known risks:** Shipping a `NoopAnalyticsClient` as the default means analytics silently does nothing until a team deliberately wires a real vendor — document this loudly so it reads as an intentional default, not a silent gap. Per data-minimization principles (relevant given this is a TruScholar project handling student/client data under DPDP 2023), the README must explicitly warn against passing names, emails, phone numbers, or other PII as event properties.

**Rollback:** Delete `packages/analytics`; nothing else has a hard dependency on it — Phase 10's optional `identify`/`reset` wiring is documented, not mandatory.

**Exit criteria:** Interface plus `Noop`/`Console` implementations typed and unit-tested; README documents vendor wiring and the PII guidance; package typechecks/lints clean.

---

## Phase 17 — `@workspace/notifications`

**Objective:** Push notification permission handling, token registration, and a typed listener interface, built on `expo-notifications` — client-side only, not a complete push solution.

**Inputs:** `expo-notifications` (Expo SDK 57); optionally `@workspace/auth`'s session (to associate a push token with a signed-in user) and `@workspace/storage` (Phase 6, to cache the last-registered token and avoid redundant re-registration).

**Changes:**

- Permission helpers: `requestNotificationPermission()`, `getNotificationPermissionStatus()`.
- `registerForPushNotifications()` — returns an Expo push token; fails loudly with a clear message rather than a cryptic native crash when run without a Development Build (the same discipline Phase 6 established for MMKV in Expo Go).
- `useNotificationListener` / `useNotificationResponseListener` — hooks for handling notifications received in the foreground/background and taps on a delivered notification.
- A typed `NotificationPayload` shape apps extend with their own data fields.

**Files created:**

```
packages/notifications/package.json
packages/notifications/src/index.ts
packages/notifications/src/permissions.ts
packages/notifications/src/registerPushToken.ts
packages/notifications/src/useNotificationListener.ts
packages/notifications/src/useNotificationResponseListener.ts
packages/notifications/src/types.ts
packages/notifications/README.md              (Expo Go vs. Development Build constraints; explicitly scopes this as client-side only — no push-sending backend included)
```

**Dependencies added:** `expo-notifications`.

**Validation:** `pnpm --filter @workspace/notifications typecheck`; real push token registration can only be meaningfully proven on a Development Build or physical device (Phase 12), so this phase's own validation is limited to typecheck plus a mocked-permission unit test — the same honesty precedent Phases 6 and 7 set for MMKV and SecureStore.

**Tests:** Unit tests for permission-status mapping and token-registration error handling, using a mocked `expo-notifications` module (interface contract only).

**Known risks:** Real push delivery needs backend infrastructure (a server calling Expo's push API or FCM/APNs directly) that doesn't exist in this blueprint — this package covers registration and receiving only, not sending; the README must state this boundary explicitly so it's never mistaken for a complete solution. Meaningful testing requires a Development Build, the same Phase 12 dependency Phases 6/7 already carry.

**Rollback:** Delete `packages/notifications`; no other phase has a hard dependency on it.

**Exit criteria:** Permission/registration/listener helpers typed and unit-tested (mocked); README explicitly scopes what this package does and does not cover; package typechecks/lints clean.

---

## Phase 18 — `@workspace/i18n`

**Objective:** Centralized internationalization support — device locale detection, key-based string translation, and a persisted user locale override — extending `@workspace/utils`'s existing date/currency/number formatters (Phase 9, currently hardcoded to `en-IN`/INR) rather than introducing a second, competing formatting system.

**Inputs:** `expo-localization` (device locale/calendar preferences); `@workspace/storage` (Phase 6, to persist a user-chosen language override); `@workspace/utils` (Phase 9) — this phase revisits its `date`/`currency`/`number` formatters to accept an optional `locale` parameter rather than replacing them.

**Changes:**

- `LocaleProvider` / `useLocale` — detects the device locale via `expo-localization`, exposes the current locale plus a `setLocale()` override persisted through `@workspace/storage`.
- Key-based translation lookup (`t(key, params)`) backed by JSON locale resource files. Whether this uses `i18next`/`react-i18next` (the RN-ecosystem standard) or a minimal hand-rolled lookup is an explicit vendor decision this phase must make and document — the same kind of vetting Phase 6 did for MMKV vs. AsyncStorage, not a silent default.
- `useTranslation` — a thin wrapper so app code imports from `@workspace/i18n`, never the underlying vendor library directly (keeps the vendor swappable later).
- Extend `@workspace/utils`'s `date.ts`/`currency.ts`/`number.ts` (Phase 9) with an optional `locale` parameter, default unchanged (`en-IN`/INR) — additive, backward compatible, not a breaking change to their existing signatures.
- A starter `en.json` locale resource (structure only) as a template apps extend with real translations and additional languages.
- RTL layout support (`I18nManager.forceRTL`) is documented as a known follow-up for whenever an RTL language is actually added — explicitly not implemented speculatively now.

**Files created:**

```
packages/i18n/package.json
packages/i18n/src/index.ts
packages/i18n/src/LocaleProvider.tsx
packages/i18n/src/useLocale.ts
packages/i18n/src/useTranslation.ts
packages/i18n/src/locales/en.json
packages/i18n/README.md                (adding a new language; RTL follow-up note; relationship to @workspace/utils' locale-aware formatters)
```

**Files modified:**

```
packages/utils/src/date.ts             (optional locale param, default unchanged)
packages/utils/src/currency.ts         (optional locale/currency param, default unchanged)
packages/utils/src/number.ts           (optional locale param, default unchanged)
```

**Dependencies added:** `expo-localization`; `i18next` + `react-i18next` pending the vendor-vetting decision above.

**Validation:** `pnpm --filter @workspace/i18n typecheck`; a throwaway wiring of `LocaleProvider` + one `useTranslation()` call into an app screen (mirroring prior phases' bundler-resolution checks); re-run Phase 9's existing `@workspace/utils` test suite to confirm the new optional `locale` parameter doesn't change its already-asserted `en-IN`/INR defaults.

**Tests:** Unit tests for `useLocale`'s device-locale detection (mocked `expo-localization`) and persisted override read/write (mocked storage adapter, matching Phases 6/7's testing pattern); a test confirming `t()` falls back to the key itself, not a crash, when a translation is missing.

**Known risks:** Retrofitting a `locale` parameter onto Phase 9's already-shipped formatters is a signature change to a package other phases may already consume — it must stay backward compatible (optional, default unchanged) so existing app code never breaks. RTL support is deliberately scoped out (documented only); do not half-implement it.

**Rollback:** Delete `packages/i18n`; revert the additive, backward-compatible `locale`-parameter changes to `@workspace/utils` if unwanted — isolated, since the parameter is optional everywhere.

**Exit criteria:** Locale detection/override and translation lookup are typed and unit-tested; the extended `@workspace/utils` formatters keep their existing tests passing unmodified; README documents adding a new language and the RTL follow-up; package typechecks/lints clean.

---

## Phase 19 — Security Review

**Objective:** Full audit per §23: token storage, logging, error reporting, env vars, secrets, deep links, debug logs, sensitive analytics, clipboard, screenshots.

**Inputs:** Completed `auth`/`api`/`storage` packages (Phases 6–8), app config (Phase 10), OTA update config (Phase 15), `analytics`/`notifications` packages (Phases 16–17, for the checklist's "sensitive analytics" and push-payload items).

**Changes:** No new features — this phase is an audit pass, output as a findings document plus any necessary fixes (e.g., stripping an accidental `console.log(accessToken)`, confirming `EXPO_PUBLIC_*` contains no secrets per §24).

**Files created:** `docs/security-review-findings.md` (or fixed inline if code changes are needed — tracked in that same doc either way).

**Validation:** Grep audit for `console.log` near token/password variable names; review of `app.config.ts`/`eas.json` for any secret committed as `EXPO_PUBLIC_*`; confirm production builds have `__DEV__`-gated logging only.

**Tests:** N/A — audit, not a code-shipping phase (though findings may trigger small fixes validated by existing test suites).

**Known risks:** A security review is only as good as its checklist; this phase's exit criteria is explicitly the §23 checklist, not an open-ended audit.

**Rollback:** N/A.

**Exit criteria:** Every item in §23's list explicitly checked off with a pass/fail/fixed status in the findings doc.

---

## Phase 20 — Performance Review

**Objective:** Audit per §30 — rendering, re-renders, list virtualization, images, memory, network, query caching, startup time, bundle size, native modules, animations, JS/UI thread — measured, not guessed.

**Inputs:** A working Development Build (Phase 12) to actually measure against.

**Changes:** Findings-driven — e.g., swapping a `FlatList` for `FlashList` only if a measured list is actually large enough to justify it (§30: "do not prematurely optimize").

**Files created:** `docs/performance-review-findings.md`.

**Validation:** Expo's bundle size report (`expo export` output sizes, already observed in Phase 2: ~2MB web JS bundle as a baseline), React DevTools Profiler for re-render audits, cold-start timing on a Development Build.

**Tests:** N/A — measurement-driven, any resulting optimization is validated by the existing test suite (Phase 13) plus before/after measurements in the findings doc.

**Known risks:** Meaningful native performance measurement (startup time, JS/UI thread) needs Phase 12's on-device build; cannot be fully done from Metro web export alone. If Phase 11's `@workspace/store` is ever adopted by an app, its Redux Toolkit/react-redux bundle-size cost should be measured here rather than assumed negligible.

**Rollback:** N/A.

**Exit criteria:** Every §30 category has a documented measurement and either a "no action needed" or a specific, justified change.

---

## Phase 21 — Final Architecture Audit

**Objective:** Check every requirement in the original spec against what was actually built, per §35 Phase 16 and the §40 Final Checklist.

**Inputs:** Everything from Phases 0–20.

**Changes:** No code — output only.

**Files created:** `docs/final-architecture-audit.md` — a table of `Requirement | Implemented? | File | Validation | Status` covering every line of the §40 checklist, plus the six required docs from §32 (`README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `DEVELOPMENT.md`, `DEPLOYMENT.md`, `SECURITY.md`) and the eight ADRs from §33 (`ADR-001` through `ADR-008`), authored during this phase if not already produced incrementally alongside their respective phases.

**Validation:** Every checklist row traces to a real file/command already validated in an earlier phase — this phase does not re-invent validation, it aggregates it.

**Tests:** N/A.

**Known risks:** If any earlier phase was skipped or partially done, this phase is where that becomes visible — by design.

**Rollback:** N/A.

**Exit criteria:** §40's full checklist has no unchecked, undocumented item; all 6 docs and 8 ADRs exist.

---

## Cross-Phase Notes

- **Numbering offset against `01_plan_prompt.md`:** Four insertions not present in the original master spec have shifted this document's numbering, in four steps. (1) Phase 11 (`@workspace/store`) was inserted 2026-09-06, so from this document's Phase 12 through 14, our numbers are the master spec's phase number **+1** (our Phase 12 = spec's Phase 11, our Phase 14 = spec's Phase 13). (2) Phase 15 (OTA Updates) was also inserted 2026-09-06, so from Phase 16 our numbers are the master spec's phase number **+2**. (3) Phases 16–17 (`@workspace/analytics`, `@workspace/notifications`) were also inserted 2026-09-06, so from Phase 18 our numbers are the master spec's phase number **+4**. (4) Phase 18 (`@workspace/i18n`) was also inserted 2026-09-06, so from this document's Phase 19 onward, our numbers are the master spec's phase number **+5** (our Phase 19 = spec's Phase 14 "Security Review", our Phase 21 = spec's Phase 16 "Final Architecture Audit"). Citations like "§35 Phase 16" inside Phase 21 refer to the master spec's own numbering, not this document's heading numbers.
- **Environment constraint:** this sandbox has no confirmed iOS/Android native toolchain. Phases 12, 13 (E2E), and parts of 20 require either a machine with Xcode/Android SDK or `eas build --profile development` runs, which need the user's Expo account/EAS project — flagged here rather than discovered late, per the master prompt's explicit instruction not to let this surface only at the end.
- **EAS/GitHub secrets:** Phase 14's CI/CD and any real Phase 12 EAS builds need user-provisioned `EXPO_TOKEN` and an EAS project — a decision/action point for the user, not something implementable unilaterally.
- **Sequencing is strict:** each phase above assumes the previous one's exit criteria were met, matching §34's "do not proceed until the current phase passes validation."
