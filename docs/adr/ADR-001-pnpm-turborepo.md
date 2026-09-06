# ADR-001 — pnpm + Turborepo

## Context

This blueprint needs to host multiple apps and shared packages (theme, UI,
storage, auth, API, hooks, utils, and more) in one repository, with strict
dependency boundaries between them, fast CI, and no duplicated
`node_modules` bloat across packages that all depend on the same
`react`/`react-native` versions.

## Decision

Use **pnpm workspaces** for package management and **Turborepo** for task
orchestration (`lint`/`typecheck`/`test`/`build` across all packages, with
caching).

## Alternatives

- **Yarn workspaces / npm workspaces** — both viable, but pnpm's strict,
  non-hoisting `node_modules` layout (symlinked from a single content-addressed
  store) catches phantom dependencies (a package using something it never
  declared) far more reliably than Yarn's or npm's more permissive hoisting —
  directly relevant here, since this repo hit exactly that class of bug
  during Phase 3 (`import/no-cycle` needing an explicit resolver) and again
  during Phase 13 (`ts-jest`'s pnpm-symlink incompatibility, worked around via
  `isolatedModules`).
- **Nx** — a heavier alternative to Turborepo with its own generators/plugin
  system; Turborepo's minimal, cache-first task runner was judged sufficient
  for this repo's actual need (running the same four scripts across N
  packages), without Nx's larger surface area and generator-driven conventions
  this blueprint doesn't need.
- **A single flat app (no monorepo)** — rejected outright: the entire premise
  of this blueprint is seeding multiple future apps' shared infrastructure
  (theme, UI, auth, API client, etc.) without duplicating it per app.

## Consequences

- Every shared package needs its own `package.json`, `tsconfig.json`, and
  test/lint config — more per-package boilerplate than a flat app, mitigated
  by `@workspace/config`'s shared base configs (ADR-003).
- pnpm's strict resolution surfaces real bugs early (phantom dependencies,
  version mismatches) rather than papering over them — a net benefit, but it
  means dependency additions must be explicit per package, not assumed
  available via hoisting.
- Turborepo's caching means `pnpm test`/`lint`/`typecheck` from root only
  re-runs what actually changed — validated repeatedly throughout this
  build (e.g. Phase 16 onward routinely showed `Cached: N cached, M total`).
- CI (`.github/workflows/pr.yml`, currently `.disable`d pending EAS setup —
  see ADR-008) runs the exact same `pnpm install --frozen-lockfile` +
  `pnpm lint`/`typecheck`/`test` commands a developer runs locally, so there
  is no separate "CI-only" configuration to drift out of sync.
