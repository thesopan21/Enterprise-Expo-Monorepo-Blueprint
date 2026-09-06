# ADR-008 — CI/CD architecture

## Context

Every push needs the same validation a developer runs locally
(format/lint/typecheck/test/expo-doctor), merges to `main` should trigger an
internal build for testing, and tagged releases should trigger a production
build+submit — all without requiring secrets that don't exist yet to block
the workflow files themselves from existing and being reviewable.

## Decision

Three GitHub Actions workflows, currently present as `.disable`-suffixed
files (not `.yml`) pending EAS provisioning — see Consequences:

- **`pr.yml`**: `pnpm install --frozen-lockfile` → `format:check` → `lint` →
  `typecheck` → `test` → `expo-doctor`, on every PR to `main`.
- **`main.yml`**: the same gate, then an `eas-build` job (preview profile)
  and an `eas-update` job (preview channel) — both gated behind a
  `check-eas-token` helper job, since a job-level `if:` cannot reference the
  `secrets` context directly (a real constraint `actionlint` caught during
  Phase 14, not a stylistic choice).
- **`release.yml`**: the same gate, then `eas-release` (production build +
  `--auto-submit`) and an `eas-update` job (production channel), on a
  `v*.*.*` tag.

Update **channels** (Phase 15) are defined via `apps/app-one/eas.json`'s
build profiles (`development`/`preview`/`production`), each mapped to a
same-named channel, so a build only ever receives updates published to the
channel it was built with.

## Alternatives

- **A single combined workflow file** — rejected: PR validation, internal
  builds, and production releases have different triggers (`pull_request`
  vs. `push` to `main` vs. a tag push) and different consequences of failure;
  splitting them keeps a PR-validation failure from ever being confused with
  a release failure.
- **Failing the workflow when `EXPO_TOKEN` is absent** — rejected: that would
  make `pr.yml`/`main.yml` permanently red until a user provisions an EAS
  project, for a repository whose core validation (format/lint/typecheck/
  test) has nothing to do with EAS at all. The `check-eas-token` gate lets
  the EAS-dependent jobs skip cleanly instead.
- **`eas update --branch <name>`** (as originally sketched when Phase 15 was
  planned) — superseded by `--channel <name> --environment <name>` after
  checking the current EAS CLI docs against this app's actual SDK 57/EAS CLI
  version: channel-based publishing is what's currently recommended, and
  `--environment` is required as of SDK 55+.

## Consequences

- **The workflows have never actually run on GitHub.** They are
  `actionlint`-clean and were built against real, current EAS CLI syntax,
  but activating them requires: renaming `main.disable`/`release.disable`/
  `pr.disble` back to `.yml`, the user provisioning an EAS project
  (`eas init`, populating `app.json`'s currently-placeholder
  `extra.eas.projectId`), and adding an `EXPO_TOKEN` repository secret. None
  of this is something a coding agent can do on the user's behalf.
- `app.json`'s `updates.url`/`extra.eas.projectId` hold a literal
  `REPLACE_WITH_EAS_PROJECT_ID` placeholder specifically so it can't be
  mistaken for a real, working value.
- Root `package.json` gained a `format:check` script (write-mode `format`
  already existed) specifically so CI can gate on formatting without ever
  mutating a contributor's working tree.
