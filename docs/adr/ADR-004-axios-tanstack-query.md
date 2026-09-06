# ADR-004 — Axios + TanStack Query (with an RTK Query alternative)

## Context

The app needs an HTTP client with request/response interceptors (auth header
injection, token refresh) and a server-state layer (caching, refetching,
loading/error states) for API data. The team also wanted the option of
Redux Toolkit's RTK Query for apps that prefer a Redux-centric architecture,
without forcing that choice onto every app.

## Decision

**Pattern A (default, used by `app-one`):** `@workspace/api` wraps `axios`
with two interceptors (`attachAuthInterceptor`, `attachRefreshInterceptor`)
and normalizes every error into a typed `ApiError`; `@tanstack/react-query`
owns server-state caching on top of that same client.

**Pattern B (available, not wired into any app):** `@workspace/store`
provides Redux Toolkit + RTK Query via an `axiosBaseQuery` wrapper around
the _same_ `@workspace/api` client instance, so switching patterns never
touches `@workspace/api`/`@workspace/auth` — only which provider wraps the
app and which package owns server-state hooks.

Both patterns are real, tested, installable packages — not one built and one
merely discussed — specifically because this is a blueprint meant to seed
multiple future apps, not a single production app with one fixed opinion.

## Alternatives

- **`fetch` instead of axios** — rejected: axios's interceptor model is what
  makes the single-flight refresh interceptor (ADR-007) straightforward;
  reimplementing that over raw `fetch` would duplicate axios's own
  well-tested behavior.
- **RTK Query's own `fetchBaseQuery` instead of wrapping axios** — rejected
  for Pattern B: it would mean two independent HTTP clients (and two sets of
  interceptor logic) if an app ever needed both patterns' data side by side,
  or migrated from one to the other. `axiosBaseQuery` keeps exactly one HTTP
  client regardless of which server-state layer is on top.
- **Only ever building one pattern** — explicitly rejected per the user's own
  direction during this build: analysis of "why not RTK Query" led to
  building both, gated behind an explicit developer choice rather than a
  silent default.

## Consequences

- A new app must pick one pattern at wiring time (root layout provider) and
  should not run both simultaneously against the same data.
- `ApiError`'s normalized shape (`NETWORK`/`TIMEOUT`/`UNAUTHORIZED`/etc.) is
  the only error shape either pattern's UI code should ever see — neither
  pattern exposes a raw Axios/RTK Query error to a screen.
- `@workspace/store`'s `exampleApi.ts` is a template to be replaced, not a
  real feature — its own README says as much.
- Phase 20's performance review flagged (not yet measured) that
  `@workspace/store`'s Redux Toolkit/react-redux bundle-size cost is unknown
  since no app has adopted it yet — a known open item, not an oversight.
