# @workspace/store

Redux Toolkit + RTK Query — **Pattern B** of the server-state choice
documented in `docs/02_phased_implementation_plan.md`'s Phase 10. Not wired
into app-one by default (app-one uses Pattern A, TanStack Query); this
package exists as a ready-to-use alternative for any app that prefers
Redux.

## Coexistence with Pattern A (TanStack Query)

A single app only ever runs one pattern at runtime. Both patterns consume
the exact same `@workspace/api` `createApiClient()` instance as their
transport — switching from Pattern A to Pattern B (or back) never touches
`@workspace/api`, `@workspace/auth`, or any other shared package; it only
changes which provider wraps the app and which package (`@tanstack/react-query`
vs. `@workspace/store`) owns server-state hooks in `src/features/*`.

## Wiring into an app

```tsx
// src/services/apiClient.ts already exists per Phase 10 — reuse it.
import { createAppStore } from '@workspace/store';
import { Provider } from 'react-redux';

import { apiClient } from '@/services/apiClient';

const { store } = createAppStore(apiClient);

export function StoreProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
```

Use this in place of Phase 10's `QueryProvider` in the app's root layout —
not alongside it.

## Replacing the example slice

`src/api/exampleApi.ts` is a template, not a real feature — it exists to
demonstrate the query/mutation/tag-invalidation pattern this package
expects. To add real endpoints:

1. Copy `exampleApi.ts` to your own `<feature>Api.ts`, using `axiosBaseQuery`
   the same way.
2. Register its `reducerPath`/`reducer` and `middleware` in `store.ts`
   alongside (or instead of) `exampleApi`.
3. Delete `exampleApi.ts` once no real endpoint depends on it — it should
   never ship as a live feature.

## Persistence (optional, not enabled)

If an app needs Redux-level cache persistence beyond what
`@workspace/storage`/`@workspace/auth` already provide, add
[`redux-persist`](https://github.com/rt2zz/redux-persist) around the store
created by `createAppStore` yourself — this package does not force it on,
since most apps' persistence needs are already covered by RTK Query's own
in-memory cache plus `@workspace/auth`'s SecureStore-backed session.

## DevTools

Redux DevTools are enabled automatically when `process.env.NODE_ENV !==
'production'` and disabled otherwise — no separate configuration needed.
