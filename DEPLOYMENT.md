# Deployment

## Status: CI/CD is built but not yet active

The workflows described below exist, are `actionlint`-clean, and were built
against real, current EAS CLI syntax — but they are currently named
`.github/workflows/{main,release,pr}.disable`/`.disble` (not `.yml`), so
GitHub does not pick them up. **They have never actually run on GitHub.**
Activating them requires the steps in "One-time EAS setup" below, which
only the repo owner can do.

## One-time EAS setup (required before any of this works)

1. Create an Expo account / organization if you don't have one.
2. From `apps/app-one`: `eas init` — this populates `app.json`'s
   `extra.eas.projectId` (currently a literal `REPLACE_WITH_EAS_PROJECT_ID`
   placeholder) with a real project ID.
3. Add an `EXPO_TOKEN` secret to this GitHub repo (Settings → Secrets and
   variables → Actions).
4. Rename `.github/workflows/main.disable` → `main.yml`,
   `release.disable` → `release.yml`, `pr.disble` → `pr.yml`.
5. Configure EAS submit credentials (App Store Connect / Play Console) if
   you want `release.yml`'s `--auto-submit` to actually submit, not just
   build.

## CI/CD architecture (once activated)

- **`pr.yml`** (on every PR to `main`): `pnpm install --frozen-lockfile` →
  `format:check` → `lint` → `typecheck` → `test` → `expo-doctor`.
- **`main.yml`** (on push to `main`): the same gate, then an EAS build
  (`preview` profile) and an OTA update publish to the `preview` channel.
- **`release.yml`** (on a `v*.*.*` tag): the same gate, then an EAS
  production build + submit, and an OTA update publish to the `production`
  channel.

The EAS-dependent jobs in `main.yml`/`release.yml` are gated behind a
`check-eas-token` helper job and skip cleanly (not fail) while `EXPO_TOKEN`
is absent — see ADR-008 for why.

## EAS Build profiles and OTA update channels

`apps/app-one/eas.json` defines three build profiles, each mapped to a
same-named OTA update channel (Phase 15):

| Profile       | Channel       | Used for                                   |
| ------------- | ------------- | ------------------------------------------ |
| `development` | `development` | Local development-client builds            |
| `preview`     | `preview`     | Internal builds from every merge to `main` |
| `production`  | `production`  | Store builds from `release.yml` on a tag   |

A build only ever receives updates published to the channel it was built
with. `app.json`'s `runtimeVersion` uses the `fingerprint` policy (not
`appVersion`) — it derives the runtime version from the actual
native-affecting project state, so a native change can't silently produce a
runtime-version mismatch through a forgotten manual version bump. See
`docs/ota-updates.md` for the full rationale, rollback procedure
(`eas update:rollback`), and the hard boundary that OTA updates can only
ship JS/asset changes, never a native module or config-plugin change.

## Manual build (without CI)

```sh
cd apps/app-one
eas build --profile preview --platform all       # or development / production
eas update --channel preview --environment preview --message "..."
```

Or fully locally, with Xcode/Android SDK installed (see `DEVELOPMENT.md`):

```sh
npx expo prebuild --clean
npx expo run:ios      # or run:android
```

## Release process

1. Merge to `main` → (once CI is active) an automatic `preview`-channel
   internal build + OTA update.
2. Tag a release: `git tag v1.2.3 && git push --tags` → (once CI is active)
   an automatic production build + submit + `production`-channel OTA
   update.
3. To ship a JS-only fix without a new store submission: `eas update
--channel production --environment production --message "..."` directly
   — no new native build needed, as long as nothing native-affecting
   changed since the build currently on that channel.

## Environment strategy

Only one environment variable currently exists
(`EXPO_PUBLIC_API_URL`) — a genuinely partial implementation of what a full
environment strategy (per-environment feature flags, analytics
configuration, environment-specific bundle identifiers) would cover. This
gap is documented, not hidden — see `docs/security-review-findings.md`
item 4 and `docs/final-architecture-audit.md`.
