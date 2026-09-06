# ADR-003 — Package boundaries

## Context

With eleven `@workspace/*` packages plus `app-one`, the repo needs a clear
rule for what belongs in a shared package versus an app, and which packages
may depend on which others, or the dependency graph degrades into an
unmanageable tangle as more apps are added.

## Decision

- **One responsibility per package**, named for what it does, not which app
  uses it: `theme` (design tokens only), `ui` (presentational components,
  theme-driven, no API/navigation imports), `storage` (key-value persistence
  adapters), `auth` (session lifecycle, SecureStore-backed), `api` (Axios
  client + interceptors), `hooks`/`utils` (small, dependency-light
  primitives), `store` (optional RTK Query pattern), `analytics`/
  `notifications`/`i18n` (vendor-agnostic interfaces over an optional native
  SDK).
- **Dependency direction is one-way**: `ui` depends on `theme`, never the
  reverse; `api` depends on `auth`'s types (for the token provider contract)
  but not the other way around; no package other than an app imports from
  another _app_.
- **Native-module dependencies are `peerDependencies`**, not bundled
  dependencies — the consuming app supplies the actual version (matching
  Expo's own SDK-alignment model), while pure-JS vendor choices a package
  fully owns (i18next, Redux Toolkit) are regular `dependencies`.
- **Optional patterns ship as real, installable packages, not just docs.**
  `@workspace/store` (RTK Query + Redux) exists alongside `app-one`'s actual
  choice (TanStack Query + Axios) specifically so a future app can pick
  either pattern without inventing one from scratch — see ADR-004.

## Alternatives

- **A single `packages/shared` catch-all** — rejected: it would immediately
  reintroduce the tangled-dependency problem this ADR exists to avoid, and
  every consumer would pull in every dependency (Redux Toolkit, i18next,
  MMKV) whether or not it used them.
- **Per-app copies of common code** — rejected: defeats the entire purpose of
  a blueprint meant to seed multiple apps' shared infrastructure.

## Consequences

- Adding a genuinely new app should require zero changes to any existing
  `@workspace/*` package — this is §40's explicit final-checklist item
  ("New application can be added without modifying shared infrastructure")
  and is the primary test this boundary rule is judged against.
- A package that needs another package's type only (e.g. `@workspace/i18n`
  importing `@workspace/storage`'s `Storage` interface) still takes it as a
  full `dependencies` entry, not a type-only side-channel — consistent with
  how `@workspace/ui` already depends on `@workspace/theme`.
- This rule was violated once, temporarily, by design: Phase 16-18's
  throwaway wiring checks (`@workspace/analytics`, `@workspace/i18n`,
  `@workspace/notifications` momentarily added to `app-one`) — each was
  reverted immediately after the bundler-resolution check, confirmed via an
  empty `git diff`, so the boundary held once the phase closed out.
- Every package's own `README.md` documents its wiring contract explicitly
  (e.g. injected dependencies, vendor swap points) so the boundary is
  discoverable without reading the implementation.
