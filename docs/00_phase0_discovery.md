# Phase 0 — Architecture Discovery

Status: **Complete — decisions made, Phase 1 in progress.**
Date: 2026-08-23

This document is the required output of Phase 0 per `01_plan_prompt.md` §35. No implementation files have been created or modified yet.

---

## 1. Current Repository State (as found)

The repository is **not** an Expo project. It is the unmodified `create-turbo` default template:

```text
apps/
├── web/     Next.js 16.3.0, React 19.2.0
└── docs/    Next.js 16.3.0, React 19.2.0

packages/
├── ui/                 @repo/ui — web React components (not React Native)
├── eslint-config/       @repo/eslint-config
└── typescript-config/   @repo/typescript-config

pnpm-workspace.yaml   → apps/*, packages/*
turbo.json            → build/lint/check-types/dev pipeline, Next.js-shaped outputs (.next/**)
package.json          → packageManager: pnpm@9.0.0, engines.node: >=18
```

None of this matches the target spec (`@workspace/*` packages, Expo apps, Expo Router, feature-oriented app architecture). This is a **material mismatch** — see Decision D1 below.

Environment observed on this machine:

```text
Node   v24.14.0
pnpm   9.0.0   (binary installed; package.json pins the same)
git    branch: main, clean except untracked docs/
```

---

## 2. Verified Current Stable Versions (as of 2026-08-23)

| Component                 | Current stable                                                                   | Notes                                                                                                                          | Source                                                           |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Expo SDK                  | **57.0.15**                                                                      | Published within the last day; SDK 56 also still current (released 2026-05-21)                                                 | expo.dev/changelog/sdk-57                                        |
| React Native (via SDK 57) | **0.86**                                                                         | No intended breaking changes from 0.85 (SDK 56)                                                                                | dev.to/davekurian/..., expo.dev/changelog/sdk-57                 |
| React (via SDK 56/57)     | **19.2**                                                                         | Same across both SDKs                                                                                                          | expo.dev/changelog/sdk-56, sdk-57                                |
| New Architecture          | **Mandatory, cannot be disabled**, since SDK 55                                  | Legacy arch only available on SDK 54 and earlier                                                                               | docs.expo.dev/guides/new-architecture                            |
| Node.js                   | **20.19+ or 22 LTS** recommended                                                 | Node 18 reached EOL 2025-04-30; current `engines.node: >=18` in root `package.json` is stale and must be raised                | github.com/expo/expo issues, docs.expo.dev                       |
| pnpm                      | Latest stable **11.21.0** (12.0.0 is RC — avoid)                                 | Installed binary here is 9.0.0, far behind. SDK 54+ supports pnpm isolated installs (no longer requires `nodeLinker: hoisted`) | pnpm.io/blog/releases/11.0, eosl.date                            |
| Turborepo                 | **2.10.x** (root already has `^2.10.11`)                                         | Already current; no change needed                                                                                              | computingforgeeks.com, npm                                       |
| TypeScript                | **~5.8+** recommended baseline by Expo; repo already has 5.9.2                   | Compatible, no change needed                                                                                                   | expo.dev/changelog/sdk-53 (baseline), current pin                |
| react-native-mmkv         | v4.x uses **NitroModules** (JSI), requires peer dep `react-native-nitro-modules` | **Not supported in Expo Go** — requires a Development Build (EAS) or prebuild. Fully compatible with New Architecture          | deepwiki.com/mrousavy/react-native-mmkv, GitHub issues #773/#781 |
| expo-secure-store         | Ships as part of the Expo SDK, versioned to match SDK 57                         | No standalone compatibility concern                                                                                            | docs.expo.dev                                                    |

---

## 3. Decisions Required Before Phase 1

Per §42 Step 6/11 of the master prompt, these are architecture-material and must not be decided silently.

### D1 — What happens to the existing Next.js scaffold?

The repo currently contains a working `create-turbo` Next.js template (`apps/web`, `apps/docs`, `packages/ui`, `packages/eslint-config`, `packages/typescript-config`). The target spec is Expo/React Native only.

- **Option A (recommended):** Remove `apps/web`, `apps/docs`, and `packages/ui` entirely; keep and adapt `packages/eslint-config`/`packages/typescript-config` as the seed for `@workspace/config`. Rename `@repo/*` → `@workspace/*` throughout.
- **Option B:** Keep the Next.js apps alongside the new Expo apps (monorepo hosts both web and mobile).
- **Option C:** Keep everything as-is and layer Expo apps in a separate path, leaving Next.js untouched.

Impact: Option A is a clean-slate rebuild matching the spec exactly, but deletes existing (unused/default) scaffold content. Options B/C add scope (dual web+mobile monorepo, Next.js CI/lint rules coexisting with Expo ones) not requested by the spec.

### D2 — How many apps, and what are they named?

Spec §1 shows `app-one/app-two/app-three/future-app` as illustrative; Phase 2 (§35) says create a single `apps/my-app`. Need real target app name(s) for this engagement.

### D3 — pnpm version to standardize on

Installed binary is 9.0.0; latest stable is 11.21.0. Recommend pinning `packageManager` to a current pnpm 10.x/11.x release and requiring contributors to use Corepack, but this requires bumping the local toolchain too.

### D4 — Expo SDK 56 vs 57

57.0.15 is newest but only ~1 day old at time of writing. 56 (released 2026-05-21) has ~3 months of field exposure. Recommend **SDK 57** per spec's "use latest stable" directive, since it is published as stable (not RC/beta) — flagging in case the team prefers the more battle-tested SDK 56.

### Decisions confirmed by user (2026-08-23)

| #   | Decision                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Remove `apps/web`, `apps/docs`, `packages/ui`; adapt `eslint-config`/`typescript-config` into `@workspace/config`; rename `@repo/*` → `@workspace/*` |
| D2  | Scaffold three apps: `apps/app-one`, `apps/app-two`, `apps/app-three`                                                                                |
| D3  | Upgrade pnpm to latest stable 11.x (from installed 9.0.0)                                                                                            |
| D4  | Target Expo SDK 57                                                                                                                                   |

---

## 4. Preliminary Phased Implementation Plan (pending D1–D4)

```text
Phase 0  — Architecture Discovery                (this document)
Phase 1  — Repository Bootstrap                   (root package.json, pnpm-workspace, turbo.json, tsconfig, .npmrc, .gitignore)
Phase 2  — Expo Application(s)                    (apps/<name>, expo doctor, expo start)
Phase 3  — @workspace/config                      (tsconfig.base/expo, eslint, prettier)
Phase 4  — @workspace/theme
Phase 5  — @workspace/ui
Phase 6  — @workspace/storage                     (MMKV + dev fallback)
Phase 7  — @workspace/auth                        (SecureStore, JWT, session)
Phase 8  — @workspace/api                         (Axios, interceptors, refresh)
Phase 9  — @workspace/hooks + @workspace/utils
Phase 10 — App architecture (features/providers/services/Router/TanStack Query)
Phase 11 — Native/CNG validation (prebuild, iOS, Android)
Phase 12 — Testing
Phase 13 — CI/CD (GitHub Actions + EAS)
Phase 14 — Security review
Phase 15 — Performance review
Phase 16 — Final architecture audit
```

## 5. Dependency Graph (package boundaries)

```text
@workspace/config   (no internal deps — pure tooling config)
@workspace/theme    (no internal deps)
@workspace/utils    (no internal deps)
@workspace/hooks    (no internal deps, may use utils)
@workspace/storage  (no internal deps)
@workspace/ui       → theme
@workspace/auth     → storage (SecureStore/MMKV), utils
@workspace/api      → auth (via interface/dependency-inversion, NOT direct import, to avoid api⇄auth cycle)
apps/<name>         → all of the above
```

## 6. Risk Register

| Risk                                                                  | Likelihood          | Impact | Mitigation                                                                           |
| --------------------------------------------------------------------- | ------------------- | ------ | ------------------------------------------------------------------------------------ |
| `react-native-mmkv` incompatible with Expo Go                         | Certain (by design) | Medium | Require Development Build from Phase 2 onward; document in README                    |
| `api` ⇄ `auth` circular dependency                                    | Medium              | High   | Enforce interface-based token provider injected into API client, verified in Phase 8 |
| pnpm 9→11 upgrade breaks lockfile / CI                                | Medium              | Medium | Upgrade in Phase 1 only, immediately re-validate `pnpm install --frozen-lockfile`    |
| SDK 57 being very new (~1 day old)                                    | Low-Medium          | Medium | Confirmed stable (not RC); fallback to SDK 56 if `expo-doctor` surfaces issues       |
| New Architecture mandatory (SDK 55+) breaks a native dependency later | Medium              | High   | Vet every native dep against New Arch before adding (§15)                            |
| Deleting existing Next.js scaffold loses unseen customization         | Low                 | High   | Confirmed via D1 before any deletion; nothing beyond default template found          |

## 7. Master Implementation Checklist

See §40 of `01_plan_prompt.md` — adopted verbatim as the exit checklist for this engagement; will be tracked and checked off phase-by-phase, not reproduced here to avoid duplication/drift.

---

**Phase 0 exit criteria:** version matrix verified ✅, risks identified ✅, dependency graph produced ✅, phased plan produced ✅ — **blocked only on D1–D4 user decisions** before Phase 1 (Repository Bootstrap) begins.
