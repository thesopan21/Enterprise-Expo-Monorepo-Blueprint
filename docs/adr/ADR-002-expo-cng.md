# ADR-002 — Expo CNG (Continuous Native Generation)

## Context

The app needs native modules (SecureStore, MMKV, notifications, updates,
localization) but the team should not need to hand-maintain Xcode
project files or Android Gradle configuration for routine native
dependency changes.

## Decision

Use Expo's **CNG (Continuous Native Generation)** workflow: `ios/`/`android/`
are never committed (both are gitignored, confirmed in
`apps/app-one/.gitignore`'s `/ios`/`/android` entries) and are regenerated
on demand via `expo prebuild`, driven entirely by `app.json`/config plugins.
Native builds go through **EAS Build** (`apps/app-one/eas.json`, Phase 15) or
a local `expo prebuild` + Xcode/Gradle build (validated for real in
Phase 12, on this environment's actual Xcode 26.6/Android SDK toolchain).

## Alternatives

- **Bare React Native workflow (committed native projects)** — gives full
  native-code control but means every native dependency change requires
  manually editing `Podfile`/`build.gradle`/`AndroidManifest.xml`, and native
  project files drift from `app.json` over time. Rejected: this blueprint's
  native surface (SecureStore, MMKV, notifications, updates, localization) is
  entirely servable through config plugins, so there's no need to hand-edit
  native projects at all.
- **Expo Go only (no custom native code)** — rejected outright: MMKV,
  `react-native-reanimated`'s New Architecture requirements, and
  `expo-notifications`' remote-push support (Android, since SDK 53) are all
  unavailable or degraded in Expo Go. This is documented explicitly in
  `packages/storage/README.md`, `packages/auth`'s SecureStore usage, and
  `packages/notifications/README.md`.

## Consequences

- `ios`/`android` directories are disposable and regenerated, not hand-edited
  — any manual native-file edit would be silently lost on the next
  `prebuild`, so config-plugin configuration in `app.json` is the only
  durable place to make native-affecting changes.
- New Architecture (Fabric + TurboModules) is mandatory for this stack
  (SDK 57, React Native 0.86.2) — validated on-device in Phase 12.
- OTA updates (Phase 15) pair naturally with CNG: the `fingerprint`
  `runtimeVersion` policy hashes exactly the parts of the project CNG
  regenerates from, so a native-affecting `app.json`/config-plugin change
  automatically produces a new runtime version with no manual bookkeeping.
- Real native builds require either a machine with Xcode/Android SDK (this
  environment has both, confirmed and used in Phase 12) or EAS Build, which
  needs a user-provisioned EAS project/`EXPO_TOKEN` — flagged as a standing
  dependency across Phases 14/15/17.
