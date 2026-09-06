# Development

## Requirements

- Node `>=20.19.0`, pnpm `11.22.0` (pinned via `package.json`'s
  `packageManager` field — use `corepack enable` to get the exact version).
- For native builds/testing: Xcode (iOS) and/or Android Studio + SDK
  (Android). Not required for pure JS/web work (`expo start --web`).

## Setup

```sh
git clone <repo>
cd Enterprise-Expo-Monorepo-Blueprint
pnpm install
pnpm --filter app-one start
```

Press `w` for web, or scan the QR code with Expo Go / a Development Build
on a device. Expo Go works for most of `app-one` but **not** for MMKV
(`@workspace/storage`) or remote push notifications on Android (SDK 53+) —
use a Development Build for those (see below).

## Environment variables

Only `EXPO_PUBLIC_API_URL` currently exists
(`apps/app-one/src/config/env.ts`), defaulting to a placeholder API URL if
unset. No `.env` file ships in this repo (none is needed yet); create
`apps/app-one/.env.local` if you need to override it locally — it's
gitignored.

**Never** put a real secret in an `EXPO_PUBLIC_*` variable — anything with
that prefix is bundled into the client and is effectively public. See
`SECURITY.md`.

## Native development (Development Builds)

This repo uses Expo CNG (ADR-002): `ios/`/`android/` are never committed.
To get a native build:

```sh
cd apps/app-one
npx expo prebuild --clean   # regenerates ios/ and android/ from app.json
npx expo run:ios            # or run:android
```

Or, without a local Xcode/Android SDK: `eas build --profile development`
(needs an EAS project — see `DEPLOYMENT.md`).

If you edit `app.json`'s native-affecting config (a config plugin,
`ios`/`android` keys) or add a native dependency, **re-run `prebuild`** —
edits to the generated `ios`/`android` folders themselves are silently lost
on the next prebuild.

## Common Metro issues

- **"Unable to resolve module"** for a workspace package: usually a
  `tsconfig.json` extending the wrong base. Packages consumed by an Expo app
  must extend `@workspace/config/tsconfig.expo.json` (bundler module
  resolution), not `tsconfig.base.json` — a `.js`-extension-on-relative-import
  pattern that typechecks fine under `tsconfig.base.json`'s `NodeNext`
  resolution can still break Metro's bundler resolution. This exact bug hit
  `@workspace/theme` early in this build.
- **Metro won't pick up a change** in a package you just edited: check
  you're not hitting a stale Metro cache — `npx expo start --clear`.
- **Silent, garbled, or stale-looking error overlay**: reload via the Dev
  Menu before assuming it's a real bug — a stale LogBox frame overlapping a
  new one produced exactly this once during this build's own Phase 12 work,
  and reloading resolved it.

## Common pnpm issues

- **"Two different types with this name exist, but they are unrelated"**
  from `ts-jest`: a pnpm-symlink/`ts-jest` LanguageService incompatibility,
  not a real type error. Fix: `"isolatedModules": true` in the package's
  `tsconfig.jest.json` (transpile-only for tests; `pnpm typecheck` already
  covers real type safety separately).
- **Jest silently runs zero tests, exits 0, prints nothing**: this
  environment's `watchman` can be present on `PATH` but broken (e.g.
  permission denied creating its own state directory) — Jest then no-ops
  instead of falling back or erroring. Both shared Jest configs
  (`packages/config/jest.config.{base,expo}.cjs`) already set
  `watchman: false` to prevent this; if you see it in a _new_ config, add
  the same line.
- **A package won't pick up a newly-added dependency**: `pnpm install` from
  the repo root (not inside the package) — pnpm's workspace resolution
  needs the root lockfile updated.

## Native dependency issues

- **ESM-only native packages breaking `ts-jest`/CommonJS** (hit with both
  `react-native-mmkv` and `expo-secure-store`): don't fight the test
  runner's module system — take the real adapter via required dependency
  injection instead, so the testable module never imports the ESM-only
  package directly (see `packages/auth/src/session.ts`,
  `packages/storage/src/mmkvStorage.ts`).
- **A native module works in a Development Build but crashes/no-ops in Expo
  Go**: check that module's README first (`packages/storage/README.md`,
  `packages/notifications/README.md` both document this explicitly) —
  MMKV and remote push notifications (Android) are Development-Build-only.
- **`expo-doctor` reports patch-version drift**: `npx expo install --check`
  to see and fix mismatches. A pre-existing drift across several `expo-*`
  packages plus a `jest`/`@types/jest` major-version gap was found (not
  fixed) during Phase 15/18 — worth a dedicated dependency-alignment pass.

## Running the test suite

```sh
pnpm test                              # every package, via Turborepo
pnpm --filter @workspace/auth test     # one package only
```

## E2E (Maestro)

```sh
cd apps/app-one
MAESTRO_CLI_NO_ANALYTICS=1 maestro test .maestro/login.yaml
```

Needs a running simulator/emulator or device with a Development Build
installed. Known issue: on this environment's Android 17 (API 37) emulator,
Maestro's `inputText` step hangs (launch/tap/assert all work) — validate on
API 34/35 or iOS/a real device instead; documented inline in the flow file.
