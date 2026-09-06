# @workspace/ui

Atomic, theme-driven UI components. Styled via `StyleSheet` and
`@workspace/theme` tokens only — no API, navigation, or business-logic
imports.

## BottomSheet — deferred

`BottomSheet` is listed in Phase 5 of the phased implementation plan but is
**not implemented in this pass**. It would require `@gorhom/bottom-sheet`
(on top of the already-present `react-native-reanimated`), and this sandbox
cannot run `expo prebuild` / `expo run:ios` / `expo run:android` to verify
real native compatibility with Expo SDK 57's mandatory New Architecture
(Phase 0 risk register). Per the plan's own rollback guidance, the rest of
the component set ships without it; add `BottomSheet` as a follow-up once
Phase 11 (Native/CNG Validation) has a Development Build to actually test
against, or once it's vetted on a machine with the native toolchain.
