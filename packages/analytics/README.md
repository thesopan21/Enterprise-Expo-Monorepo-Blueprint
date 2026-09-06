# @workspace/analytics

A vendor-agnostic analytics interface. Feature code depends on the
`AnalyticsClient` interface, never on a specific vendor SDK — so choosing
(or changing) a vendor never touches feature code, only the one place that
constructs the client.

## Why the default does nothing

`noopAnalyticsClient` — the client this package ships as its main
implementation to reach for — implements every `AnalyticsClient` method as a
no-op. **This is deliberate, not a placeholder bug:** no vendor has been
chosen for this blueprint, and silently sending events to a vendor nobody
configured would be worse than sending none. Analytics stays off until a
team deliberately wires a real vendor in their own app.

`consoleAnalyticsClient` is a second, dev-only implementation that logs
every call to the console instead of sending it anywhere — use it to verify
instrumentation (call sites, event names, property shapes) before a vendor
exists to send events to.

## Do not track PII

Per TruScholar's DPDP 2023 data-minimization practice, **never pass names,
emails, phone numbers, student/client IDs, or any other personally
identifiable information as event properties or traits** — including inside
`identify()`'s `traits` argument. Analytics events frequently end up
retained far longer, and with far less access control, than the systems of
record they describe. Use an opaque internal user ID for `identify()`, and
keep event properties limited to non-identifying metadata (e.g. a screen
name, a feature flag value, a plan tier) — never the data a user typed in.

## Wiring a real vendor

Implement `AnalyticsClient` against your chosen vendor's SDK in the
**consuming app** (never inside this package — that would make every app
pull in an SDK it might not use):

```ts
// apps/<app>/src/services/analytics.ts
import type { AnalyticsClient } from "@workspace/analytics";
import * as SomeVendor from "some-vendor-sdk";

export const analyticsClient: AnalyticsClient = {
  track(event, properties) {
    SomeVendor.track(event, properties);
  },
  screen(name, properties) {
    SomeVendor.screen(name, properties);
  },
  identify(userId, traits) {
    SomeVendor.identify(userId, traits);
  },
  reset() {
    SomeVendor.reset();
  },
};
```

Swap `noopAnalyticsClient`/`consoleAnalyticsClient` for `analyticsClient` at
the single call site that constructs it (typically wherever the app's other
service singletons — `apiClient`, `sessionManager` — are created); no other
code changes.

## Screen-view tracking

`useScreenTracking(client, properties?)` calls `client.screen()` whenever
Expo Router's current pathname changes. Call it once, near the app root
(e.g. in the root layout, alongside other providers):

```tsx
import { analyticsClient } from "@/services/analytics";
import { useScreenTracking } from "@workspace/analytics";

export default function RootLayout() {
  useScreenTracking(analyticsClient);
  // ...
}
```

## Optional integration points

- **Sign-in:** call `client.identify(userId)` once a session is established.
- **Sign-out:** call `client.reset()` so the next session doesn't inherit the
  previous user's identity.

Neither call is required by this package or any other — they're documented
here as the natural integration points, left for each app to wire in
alongside its own auth flow.
