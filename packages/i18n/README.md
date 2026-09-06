# @workspace/i18n

Device locale detection, a persisted user locale override, and key-based
string translation.

## Vendor decision: i18next + react-i18next

This package uses [i18next](https://www.i18next.com/) +
[react-i18next](https://react.i18next.com/), the RN-ecosystem standard,
rather than a hand-rolled lookup — the same kind of explicit vetting Phase 6
did for MMKV vs. AsyncStorage. Pluralization and interpolation across many
languages are genuinely hard to get right (many languages have three to six
plural forms, not just singular/plural); i18next has already solved this
correctly, and reimplementing it would be a correctness risk for no real
benefit. App code never imports `react-i18next` directly — only
`useTranslation`/`LocaleProvider` from `@workspace/i18n` — so the vendor
stays swappable later without touching call sites, the same boundary
`@workspace/analytics` and `@workspace/store` draw around their own vendor
choices.

## Wiring into an app

```tsx
import { LocaleProvider } from "@workspace/i18n";
import { mmkvStorage } from "@workspace/storage";

export default function RootLayout() {
  return <LocaleProvider storage={mmkvStorage}>{/* rest of the app */}</LocaleProvider>;
}
```

`storage` is injected — like `createSessionManager`'s `SecureStoreAdapter`
and `createAppStore`'s `AxiosInstance` — so this package never imports a
concrete storage implementation itself and stays fully unit-testable
without native modules. Use `mmkvStorage` in a real app; `memoryStorage`
(also from `@workspace/storage`) is fine for tests or a temporary/throwaway
wiring check.

```tsx
import { useTranslation } from "@workspace/i18n";

function SomeScreen() {
  const { t } = useTranslation();
  return <Typography>{t("common.ok")}</Typography>;
}
```

```tsx
import { useLocale } from "@workspace/i18n";

function LanguageSetting() {
  const { locale, setLocale } = useLocale();
  return <Button label="Français" onPress={() => setLocale("fr-FR")} />;
}
```

## Locale detection and override

On mount, `LocaleProvider` checks `storage` for a previously persisted
locale override; if none exists, it falls back to the device's preferred
locale via `expo-localization`'s `useLocales()`. Calling `setLocale()`
persists the new value through `storage` and switches i18next's active
language — the override then takes precedence over the device locale on
every subsequent app launch, until cleared.

## Adding a new language

1. Add `packages/i18n/src/locales/<code>.json`, matching `en.json`'s key
   structure exactly (a missing key falls back to the key string itself,
   not a crash — see `packages/i18n/src/i18n.ts` — so an incomplete
   translation degrades gracefully, but should still be filled in).
2. Register the new resource bundle in `packages/i18n/src/i18n.ts`'s
   `resources` object.
3. Call `setLocale()` with that language's tag from a language-picker
   screen in the consuming app.

## Missing translations

A key with no translation in the active language (and no `en` fallback
either) renders as the literal key string — this is i18next's own default
behavior, not a bug, and it's the reason it's safe to add new keys before
every locale file has caught up.

## RTL: not implemented

Right-to-left layout support (`I18nManager.forceRTL`) is a deliberate,
documented gap, not an oversight — it is real, non-trivial work (mirroring
every layout, not just text direction) that has no payoff until an actual
RTL language (Arabic, Hebrew, etc.) is added. Implementing it speculatively
now, with only `en.json` shipped, would be guesswork rather than something
verifiable. When an RTL language is actually added:

1. Add its locale file (see above).
2. Call `I18nManager.forceRTL(true)` and `I18nManager.allowRTL(true)`
   before the app's UI mounts.
3. **Restart the app** — `forceRTL` only takes effect on the next launch,
   not immediately.
4. Audit `packages/ui`'s components for hardcoded `left`/`right` styles
   that should be logical (`start`/`end`) instead.

## Relationship to `@workspace/utils`'s formatters

`@workspace/utils`'s `formatDate`/`formatCurrency`/`formatNumber` (Phase 9)
already accept an optional `locale` parameter — this package doesn't
replace them or introduce a second formatting system. Pair them with
`useLocale()`'s current `locale` for locale-aware formatting:

```tsx
import { useLocale } from "@workspace/i18n";
import { formatCurrency } from "@workspace/utils";

const { locale } = useLocale();
formatCurrency(amount, "INR", locale);
```
