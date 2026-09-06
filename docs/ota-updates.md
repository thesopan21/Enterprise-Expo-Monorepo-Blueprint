# OTA Updates (`expo-updates` + EAS Update)

app-one ships JavaScript/asset changes over-the-air via [EAS Update](https://docs.expo.dev/eas-update/introduction/), skipping the app-store review cycle for JS-only changes. This document records the policy decisions made in Phase 15 and why, plus the rollback procedure.

## `runtimeVersion` policy: `fingerprint`

`app.json`'s `runtimeVersion` is set to `{ "policy": "fingerprint" }` rather than `{ "policy": "appVersion" }`.

**Why:** the `appVersion` policy only bumps the runtime version when `expo.version` is bumped by hand. If a native module or config plugin changes and `expo.version` isn't bumped to match, an OTA update built against the new native code gets silently offered to — and silently rejected by — an old build with the mismatched runtime, or worse, offered to a build it isn't actually compatible with. There is no error in either case; the update is just never applied. `fingerprint` instead hashes the parts of the project that affect the native runtime (config plugins, native dependencies, prebuild config) and derives the runtime version from that automatically, so a native-affecting change always produces a new runtime version with no manual bookkeeping. The cost is that a native-affecting change requires a fresh native build before an update can target it — which is true either way, `fingerprint` just makes the mismatch impossible to forget.

## In-app update check: rely on the default (`checkAutomatically: "ON_LOAD"`)

`app.json`'s `updates.checkAutomatically` is explicitly set to `"ON_LOAD"` (expo-updates' own default) rather than adding a custom `Updates.checkForUpdateAsync()`/`Updates.fetchUpdateAsync()` call (e.g. on `AppState` foreground transitions).

**Why:** a mobile app is normally relaunched (cold start) far more often than it's left running in the background for long stretches, so a launch-time check catches the overwhelming majority of real sessions with zero added code. A foreground-triggered check is a reasonable enhancement for an app with unusually long-lived sessions, but it's extra complexity and an extra network call this blueprint doesn't need yet — add it in a specific app if that app's usage pattern calls for it, rather than baking it into the shared starting point.

## Channels and branches

Channels are defined via `apps/app-one/eas.json`'s build profiles, which is the mechanism EAS Update uses to decide which branch a given build's updates come from:

| Build profile | Channel       | Used for                                                 |
| ------------- | ------------- | -------------------------------------------------------- |
| `development` | `development` | Local development-client builds                          |
| `preview`     | `preview`     | Internal builds produced on every merge to `main`        |
| `production`  | `production`  | Store builds produced by `release.yml` on a `v*.*.*` tag |

A build only ever receives updates published to the channel it was built with — a `preview` build never sees a `production`-channel update and vice versa. This is intentional: it keeps unreviewed `main` changes from ever reaching a build already in front of end users.

## CI publish steps

`.github/workflows/main.disable` (renamed from `main.yml` — see note below) publishes to the `preview` channel after every successful `eas-build` on merge to `main`:

```
npx eas-cli update --channel preview --environment preview --message "<commit sha>" --non-interactive
```

`.github/workflows/release.disable` (renamed from `release.yml`) publishes to the `production` channel after every successful `eas-release` build+submit on a version tag:

```
npx eas-cli update --channel production --environment production --message "<tag name>" --non-interactive
```

Both steps are gated behind the same `check-eas-token` job Phase 14 introduced, so they're skipped (not failed) until `EXPO_TOKEN` exists as a repo secret.

> **Note on the `.disable` extension:** `main.yml`/`release.yml` were renamed to `main.disable`/`release.disable` (commit `09cb119`) so GitHub Actions won't pick them up as active workflows while the EAS project/`EXPO_TOKEN` are still unprovisioned. Rename them back to `.yml` once that setup (see Known risks below) is complete.

## Known risks / boundaries

- **Runtime mismatch is silent.** Even with the `fingerprint` policy, a build published from a different git state than the one an update is built from can still end up incompatible in edge cases (e.g. hand-edited native project files outside of `prebuild`). Always verify a test update actually applies on a real Development Build before trusting a channel.
- **OTA updates cannot ship native changes.** Any change to a native module, config plugin, or native project file requires a full rebuild through Phases 12/14 (`eas build`), not an OTA update. This is a hard boundary of the platform, not a configuration choice — treat any suggestion of using OTA updates to skip app-store review universally as a misunderstanding of what they can do.
- **Requires the same user-provisioned EAS project and `EXPO_TOKEN` secret Phase 14 already flagged.** `app.json`'s `extra.eas.projectId` and `updates.url` currently hold a `REPLACE_WITH_EAS_PROJECT_ID` placeholder — running `eas init` (or `eas update:configure`) against a real EAS account populates both with the real project ID. Nothing in this phase can provision that account on the user's behalf.

## Rollback

- **To roll back a bad update:** publish a previous known-good update to the affected channel, or use `eas update:rollback` to point the channel's branch back at an earlier update — no rebuild needed, since this only changes which update a channel serves.
- **To disable OTA updates entirely:** remove `expo-updates` from `apps/app-one/package.json`'s dependencies and delete the `updates`/`runtimeVersion` keys from `app.json`. This is additive-only and isolated — it reverts app-one to store-review-only releases with no other code depending on it.
