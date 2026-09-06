# Contributing

## Before you start

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the package graph and
dependency rules, and check `docs/02_phased_implementation_plan.md` for the
phase this work falls under (or note that it doesn't fall under any
existing phase, if it's genuinely new scope).

## Adding a new app

Nothing in `packages/*` should need to change. Scaffold under `apps/`, add
the `@workspace/*` packages it needs as real dependencies (following the
peer/regular-dependency convention in `ARCHITECTURE.md`), and give it its
own `tsconfig.json` extending `@workspace/config/tsconfig.expo.json`. If
adding the app requires touching a shared package, that's a signal the
package boundary needs re-examining (ADR-003), not that the new app is
wrong.

## Adding a new shared package

1. `packages/<name>/package.json`, `tsconfig.json` (extend
   `@workspace/config`), `jest.config.cjs`, `eslint.config.mjs` — copy an
   existing package's (e.g. `packages/analytics`) as a template.
2. One responsibility per package (ADR-003) — if you're adding a second
   unrelated concern, that's two packages, not one.
3. A README documenting: what it does, what it deliberately does _not_ do,
   any injected dependencies and why, and any vendor-swap boundary.
4. Real native modules as `peerDependencies` + a `devDependency` pin; pure-JS
   dependencies the package owns as regular `dependencies`.
5. `pnpm install` from the repo root, then `pnpm --filter @workspace/<name>
typecheck`/`lint`/`test`.

## Before opening a PR

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```

All four must pass — this is exactly what `pr.yml` runs in CI (currently
`.disable`d pending EAS setup, see `DEPLOYMENT.md`, but the commands
themselves are what get validated either way).

If you touched anything native-module-related, also run `npx expo-doctor`
from `apps/app-one`.

## Testing conventions

- Dependency-injected adapters (`SecureStoreAdapter`, `Storage`) get a local
  mock factory function per test file (`createMockAdapter()`), not the real
  implementation and not a shared singleton reused across test files — see
  `packages/auth/src/session.test.ts` for the pattern.
- `@testing-library/react-native` v14's `render`/`fireEvent`/`renderHook`
  are all async — always `await` them.
- A package mixing plain-logic and React/RN-dependent code (e.g.
  `@workspace/i18n`, `@workspace/analytics`) uses the `jest-expo` preset for
  the whole package rather than splitting configs — see any of those
  packages' `jest.config.cjs`.
- Mock external modules explicitly (`jest.mock("expo-router", () => ...)`)
  rather than relying on an implicit automock, and always
  `jest.clearAllMocks()`/`afterEach` when a test asserts on call counts —
  a real bug from skipping this was caught and fixed during Phase 17
  (mock-leakage across test cases in `registerPushToken.test.ts`).

## Commit style

Short, imperative subject line ("Add", "Fix", "Update" — not "Added"),
sentence case, no conventional-commit prefixes. Body only when the _why_
isn't obvious from the subject. See `git log` for the existing pattern.

## Documentation debt

If you find something already broken or undocumented while working nearby
(the pattern this whole build followed throughout `docs/
02_phased_implementation_plan.md`), fix or document it rather than working
around it silently — see `docs/final-architecture-audit.md` for the
standard this repo holds itself to.
