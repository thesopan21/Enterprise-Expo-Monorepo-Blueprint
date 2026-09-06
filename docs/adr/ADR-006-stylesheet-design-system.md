# ADR-006 — StyleSheet-based design system

## Context

`@workspace/ui`'s components need a styling approach that's consistent with
React Native's own primitives, works identically across iOS/Android/web
(`react-native-web`), and doesn't add a large, opinionated styling framework
dependency to a blueprint meant to stay adoptable by apps with their own
preferences.

## Decision

Use React Native's built-in `StyleSheet.create()` throughout, driven entirely
by `@workspace/theme`'s typed design tokens (`colors`, `spacing`,
`typography`, `radius`, `shadows`, `elevation`) — no NativeWind, no
styled-components, no Tailwind-for-RN.

## Alternatives

- **NativeWind (Tailwind for React Native)** — rejected: it's a genuinely
  popular choice, but it couples the design system to Tailwind's utility-class
  conventions and a build-time transform; `StyleSheet` + typed tokens gives
  the same "no magic numbers, theme-driven values" benefit without that
  dependency or its own learning curve for teams unfamiliar with Tailwind.
- **styled-components / Emotion** — rejected: both add a runtime
  CSS-in-JS layer with a real performance cost on React Native (style objects
  computed per-render unless memoized carefully) that `StyleSheet.create()`'s
  static, hoisted style objects avoid by construction.
- **Inline style objects everywhere (no `StyleSheet.create`)** — rejected:
  loses `StyleSheet`'s reference-stability and platform-specific
  optimizations for no benefit.

## Consequences

- Every `@workspace/ui` component takes theme values from `@workspace/theme`
  directly (e.g. `theme.colors.light`, `theme.spacing[3]`) rather than
  hardcoding colors/spacing — verified by code review across Button, Input,
  Card, Typography, and the rest of Phase 5's component set.
- Dark mode is representable (`@workspace/theme` exports both `lightColors`
  and a palette structure that supports a dark variant) but **no component
  currently switches on it** — `@workspace/ui`'s components hardcode
  `theme.colors.light` rather than reading from a theme-mode context. This is
  a real, current gap surfaced by this audit (Phase 21), not a decision made
  and documented at the time — see `docs/final-architecture-audit.md`.
- No design-token build step or Tailwind config to maintain — tokens are
  plain TypeScript, typechecked like any other code.
- Adding a new themed component never requires touching `@workspace/theme`
  unless a genuinely new token category is needed (e.g. a new color, not a
  new one-off style) — consistent with the package-boundary rule in ADR-003.
