# Enterprise Expo Monorepo Blueprint

A pnpm/Turborepo monorepo blueprint for Expo (React Native) apps —
shared design tokens, UI components, storage, auth, API client, and
optional analytics/notifications/i18n packages, seeded once and reused
across every future app added to this repo.

> **Start here:** [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for how the pieces
> fit together, [`DEVELOPMENT.md`](./docs/DEVELOPMENT.md) to get running locally,
> [`docs/02_phased_implementation_plan.md`](./docs/02_phased_implementation_plan.md)
> for the full build history, and
> [`docs/final-architecture-audit.md`](./docs/final-architecture-audit.md)
> for where things currently stand against the original spec.

## Repository structure

```text
apps/
  app-one/               Expo Router app (SDK 57, React Native 0.86, New Architecture)
packages/
  config/                Shared tsconfig/eslint/prettier/jest base configs
  theme/                 Design tokens (colors, spacing, typography, radius, shadows)
  ui/                     Presentational component library (Button, Input, Card, ...)
  storage/               Key-value storage adapters (MMKV, in-memory)
  auth/                  Session lifecycle, SecureStore-backed token storage
  api/                   Axios client, auth/refresh interceptors, normalized errors
  hooks/ utils/          Small, dependency-light shared primitives
  store/                 Optional Redux Toolkit + RTK Query pattern (not wired into app-one)
  analytics/             Vendor-agnostic analytics interface (noop by default)
  notifications/         Push notification permissions/registration/listeners
  i18n/                  Locale detection + i18next-backed translation
docs/
  01_plan_prompt.md                    Master specification this blueprint was built against
  02_phased_implementation_plan.md     Per-phase build log (Objective/Changes/Validation/... per phase)
  ARCHITECTURE.md CONTRIBUTING.md      Package graph/dependency rules; contribution guide
  DEVELOPMENT.md DEPLOYMENT.md         Local setup/troubleshooting; EAS builds/CI/CD/release process
  SECURITY.md                          Token storage, what never to log, reporting a vulnerability
  adr/                                 Architecture Decision Records (ADR-001 .. ADR-008)
  *-review-findings.md                 Security/performance audit findings
  final-architecture-audit.md          §40 checklist traced to real evidence
```

## Package responsibilities and dependency rules

See [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full graph and the rule
each package follows (one responsibility, native modules as peer
dependencies, one-way dependency direction). The short version:
`ui` depends on `theme`; `api` depends on `auth`'s types; nothing depends on
an app; every optional package (`store`, `analytics`, `notifications`,
`i18n`) is a real, installable package an app opts into, not just
documentation.

## Getting started

```sh
pnpm install
pnpm --filter app-one start
```

See [`DEVELOPMENT.md`](./docs/DEVELOPMENT.md) for the full setup (native
toolchain requirements, environment variables, common Metro/pnpm/native
issues) and [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for EAS builds, OTA updates,
and CI/CD.

## Common commands

| Command                                      | What it does                           |
| -------------------------------------------- | -------------------------------------- |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Run across every package via Turborepo |
| `pnpm format` / `pnpm format:check`          | Prettier, write or check-only          |
| `pnpm --filter <package> <script>`           | Run a script in one package only       |
| `pnpm --filter app-one start`                | Start Metro for the app                |

## Documentation index

| Doc                                                                            | Covers                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md)                                    | Package graph, dependency rules, key architectural decisions       |
| [`CONTRIBUTING.md`](./docs/CONTRIBUTING.md)                                    | Adding a package/app, PR expectations, commit style                |
| [`DEVELOPMENT.md`](./docs/DEVELOPMENT.md)                                      | Local setup, native builds, environment variables, troubleshooting |
| [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md)                                        | EAS builds, OTA updates, CI/CD, release process                    |
| [`SECURITY.md`](./docs/SECURITY.md)                                            | Token storage, what never to log, reporting a vulnerability        |
| [`docs/adr/`](./docs/adr/)                                                     | ADR-001 through ADR-008, one per major architectural choice        |
| [`docs/security-review-findings.md`](./docs/security-review-findings.md)       | Phase 19's §23 audit                                               |
| [`docs/performance-review-findings.md`](./docs/performance-review-findings.md) | Phase 20's §30 audit                                               |
| [`docs/final-architecture-audit.md`](./docs/final-architecture-audit.md)       | Phase 21's §40 checklist, traced to evidence                       |

## License

MIT — see [`LICENSE.md`](./LICENSE.md).
