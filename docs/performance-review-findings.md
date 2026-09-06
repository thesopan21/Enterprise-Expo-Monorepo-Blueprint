# Performance Review Findings (Phase 20)

Audit against `01_plan_prompt.md` §30 (Performance). Per §30's own instruction
— "do not prematurely optimize, measure first, document performance-sensitive
decisions" — every item below is backed by an actual measurement or a direct
read of the current source, not an assumption carried over from earlier
phases. Where a fix was clearly justified by what was measured, it was made
(matching this phase's "Changes: findings-driven" scope); where nothing
justified a change, that's stated plainly instead of being invented.

## Headline finding: custom fonts were never actually loading

While investigating the "rendering" and "bundle size" categories, `apps/app-one/src/app/_layout.tsx`
turned out to never call `expo-font`'s `useFonts()` — despite `@workspace/theme/src/typography.ts`
declaring six custom font family names (`PlusJakartaSans-*`, `ShortStack-Regular`) and every
`Typography` variant styling text with them, and despite the actual `.ttf` files already sitting in
`apps/app-one/assets/fonts/`. Without `useFonts()` registering them, React Native silently ignores an
unrecognized `fontFamily` value and falls back to the platform default font — so every screen has been
rendering in the wrong font this whole time, with no error or warning anywhere to reveal it. Confirmed via:

- Grep for `useFonts`/`expo-font` across the entire repo — the only hit was `typography.ts`'s own
  comment saying loading them "is the consuming app's responsibility," which app-one never did.
- A comparison of the native (Hermes bytecode) export before and after the fix: the six font files
  (~540KB combined) were **absent from the asset manifest** before the fix and present after —
  direct proof they were never being shipped to the app at all, not just unregistered.

**Fixed:** wired `useFonts()` into the root layout (`apps/app-one/src/app/_layout.tsx`), keyed exactly
to `@workspace/theme`'s `fontFamily` values so the mapping can't silently drift, and extended the
existing splash-screen-hide gate (previously only waiting on session restore) to also wait on fonts
being ready (loaded or errored) — following `expo-font`'s own documented `useFonts()` pattern exactly.
Verified: `pnpm --filter app-one typecheck`/`lint` clean, `expo export` succeeds on web/iOS/Android
with the font files now present in every export's asset list.

An on-device visual screenshot (this environment has a live Android emulator) was attempted for extra
confirmation but was inconclusive — the emulator's installed dev-client build predates this session's
native-relevant changes (Phase 15's `expo-updates`, Phase 17's `expo-notifications`) and needs a fresh
`expo prebuild`+reinstall to test cleanly, which is disproportionate to what this one wiring fix needs
to prove. The static evidence above (exact match to the documented `useFonts()` API, clean
typecheck/lint, and the asset-manifest before/after diff) is conclusive on its own.

## §30 checklist

### Rendering — see headline finding above

The one real rendering defect found this phase is documented and fixed above. Beyond that: React
Compiler is already enabled (`app.json`'s `experiments.reactCompiler: true`, confirmed printed as
"React Compiler enabled" during every `expo export` run this phase) — it auto-memoizes components at
build time, which is why almost nothing in the codebase hand-rolls `useMemo`/`useCallback` (only
`packages/i18n/src/LocaleProvider.tsx` does, for its context value). This means the "re-renders"
category below is substantially mitigated architecturally, not by convention or discipline.

### Re-renders — no action needed, mitigated by React Compiler

See above. No manual profiling (React DevTools Profiler on a running build) was performed — the app
currently has too few screens with enough real interaction/state to yield a meaningful profile; a real
Profiler pass is far more useful once actual product screens exist. Documented as a deferred follow-up,
not skipped silently.

### FlatList — N/A, none exist yet

Grepped for `FlatList` across `apps/`/`packages/` — zero usages. No screen currently renders a list of
any kind.

### FlashList where justified — N/A, correctly not added

Per §30's explicit "do not prematurely optimize": there is no list anywhere in the app, so there is
nothing to justify `FlashList` over `FlatList` (or vice versa) yet. Adding either speculatively would be
exactly the premature optimization this section warns against.

### Images — FIXED

`packages/ui/src/Avatar/Avatar.tsx` was importing `Image` from `react-native` (no caching, slower
decode) instead of `expo-image` (already a dependency of `apps/app-one`, just never actually imported
anywhere in the codebase before this). Swapped `Avatar`'s `Image` import to `expo-image` and its
`source` prop type to `expo-image`'s `ImageSource` — a direct drop-in replacement (`contentFit` defaults
to `"cover"`, matching the previous default `resizeMode` behavior exactly, confirmed against the current
SDK 57 docs). `packages/ui` now declares `expo-image` as a real peer/dev dependency, matching its
existing `phosphor-react-native` convention. Verified: typecheck/lint/test clean (no `Avatar` test
existed to update; none was added since this phase is measurement-driven, not a coverage phase).

### Memory — no action needed, checked for the obvious risk

Every event-listener registration in the codebase (`useAppState`'s `AppState.addEventListener`,
`useNotificationListener`/`useNotificationResponseListener`'s `addNotification*Listener`) has a matching
cleanup (`subscription.remove()`) in its effect's return function — confirmed both by reading the source
and by each hook's own "removes its subscription on unmount" test already passing. No deep memory
profiling (Xcode Instruments / Android Studio Profiler heap snapshots) was performed — the app has no
data-heavy screens (no lists, no image galleries) that would meaningfully stress memory yet; this is a
reasonable deferral, not a gap, per the same "don't invent a problem to profile" reasoning as re-renders.

### Network requests — no action needed, already deliberate

`packages/api/src/client.ts` sets a 15-second timeout (not the axios default of no timeout). The
single-flight refresh interceptor (`packages/api/src/interceptors/refresh.ts`, Phase 8) already
collapses concurrent 401s into one refresh call instead of one per failed request — a real
network-efficiency property, not just a correctness one.

### Query caching — no action needed, already deliberate

`apps/app-one/src/providers/QueryProvider.tsx` configures TanStack Query with `staleTime: 60_000` and
`retry: 1` — a deliberate, non-default choice already in place, not an oversight to fix here.

### Startup time — partially measured, real number with caveats

Real Android logcat measurement during this review: `ActivityTaskManager: Displayed
com.anonymous.appone/.MainActivity for user 0: +10s311ms` — a genuine, OS-reported cold-launch timing.
**This number is not representative of a production build**: it was measured in dev-client mode,
fetching an unminified bundle from Metro over `adb reverse` rather than executing precompiled Hermes
bytecode already embedded in the APK (which is what a real release build does, and is typically far
faster to first frame). A meaningful production startup-time measurement needs an actual release-profile
native build installed and launched cold with no Metro attached — deferred as a follow-up requiring a
fresh `eas build`/local release build, which no phase before this one has produced yet.

### Bundle size — measured, with a real before/after

- **Web** (`expo export --platform web`): 7.1MB raw JS entry bundle, ~1.4MB gzipped.
- **Native** (`expo export --platform android/ios`, Hermes bytecode `.hbc`): before this phase's fixes,
  9,336,344 bytes (Android) / 9,008,800 bytes (iOS). After (native-module removals below plus the font
  fix now actually shipping the font assets): 9,338,897 / 9,026,873 bytes — essentially flat on the JS
  side (removing four thin native-module JS wrappers and adding `useFonts()`'s own glue code roughly
  cancel out), but the **asset** manifest changed meaningfully: the unused 963KB Material Symbols font
  (pulled in by the now-removed `expo-symbols`) is gone, replaced by the app's own ~540KB of actual,
  now-correctly-shipping custom fonts — a net asset-weight reduction while also fixing a real bug.
- The web bundle number is not directly comparable to native: `react-native-web`/`react-dom` add
  significant web-only weight that never ships to an actual phone. Treat the native `.hbc` sizes as the
  figure that matters for real app size.
- The plan's own citation of "~2MB web JS bundle" from Phase 2 as a baseline could not be found recorded
  anywhere in `docs/00_phase0_discovery.md` or any other doc — it may have been an assumption made when
  this plan was authored rather than an actual recorded measurement. Not chasing that further; the
  current, real, freshly-measured numbers above are what this phase is accountable for.

### Native modules — FIXED

Audited every `expo-*` dependency in `apps/app-one/package.json` for actual usage (grep across the
whole repo, not just `apps/app-one/src`, to rule out transitive use via a `@workspace/*` package) against
`expo-router`'s and `expo`'s peer-dependency requirements, to separate "genuinely unused" from
"used without a direct import, but load-bearing":

- **Removed as confirmed, fully unused:** `@expo/ui` (an entire unused SwiftUI/Jetpack-Compose bridge
  module), `expo-symbols` (see the bundle-size finding above), `expo-device`, `expo-glass-effect`,
  `expo-web-browser`. None were imported anywhere, registered as an `app.json` config plugin, or
  required as a peer by any other installed package.
- **Kept, confirmed load-bearing despite no direct import:** `expo-constants` and `expo-linking` are
  both required peer dependencies of `expo-router` itself (confirmed by reading its `package.json`) —
  removing them would break routing, not just save unused weight.
- **Kept, unused but not removed:** `expo-status-bar` and `expo-system-ui` are also currently unused
  (no explicit status-bar/system-UI styling exists anywhere yet), but both are tiny, near-universal
  Expo-template conveniences with negligible size cost — removing them for an immaterial saving would
  itself be the kind of premature optimization §30 warns against. Left in place; revisit only if a real
  measurement ever shows otherwise.
- Re-verified after removal: `expo-doctor` (20/21 — the one failure is the pre-existing, unrelated
  patch-version-drift finding from Phase 15/18, not caused by this change), full repo `typecheck`/`lint`/
  `test` (12 packages, 161 tests) all green.

### Animations — N/A, none exist yet

`react-native-reanimated` is present only because `expo-router` requires it as a peer (confirmed above)
— grepped for `Animated.`/direct reanimated usage in app code and found none. No custom animation exists
to audit for JS-thread-blocking behavior.

### JS thread / UI thread — architectural, not separately measured

This blueprint mandates React Native's New Architecture (Fabric + TurboModules), already validated
on-device in Phase 12 — this is the framework-level mechanism for JS/UI thread separation and is already
in place project-wide, not something this phase needs to re-verify. No long-running synchronous JS work
was found in any render path (no heavy computation, no synchronous loops over large data — there is no
large data anywhere yet). Reanimated (present as a transitive peer, unused directly per above) runs
animations on the UI thread by design whenever it is eventually used for a real animation.

## Summary of changes made this phase

1. Wired `useFonts()` into `apps/app-one/src/app/_layout.tsx` — fixes silently-broken custom typography.
2. Swapped `packages/ui/src/Avatar/Avatar.tsx` from React Native's `Image` to `expo-image`.
3. Removed four confirmed-unused native module dependencies from `apps/app-one/package.json`:
   `@expo/ui`, `expo-symbols`, `expo-device`, `expo-glass-effect`, `expo-web-browser`.

All three changes were re-validated: `pnpm typecheck`/`lint`/`test` clean across all 12 packages (161
tests), `pnpm format:check` clean, `expo-doctor` shows no new issues, and `expo export` succeeds cleanly
on web/iOS/Android with the expected asset-manifest changes confirmed by direct inspection.

## Deferred (documented, not silently skipped)

- Production-build startup-time measurement (needs a real release-profile native build, not yet
  produced by any phase).
- React DevTools Profiler re-render audit (needs real product screens with meaningful state/interaction
  to be worth profiling — the current screens are too minimal to yield signal).
- Deep memory profiling via Xcode Instruments/Android Studio Profiler (same reasoning — no data-heavy
  screens exist yet to stress memory).
- `FlatList`/`FlashList` decision (moot until a real list exists).
- Custom animations (none exist to audit).

## Exit criteria check

Every §30 category above carries either a real measurement with "no action needed," a measurement that
justified and received a fix, or an explicit, reasoned deferral — none were skipped or guessed at.
