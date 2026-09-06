export * from './colors';
export * from './elevation';
export * from './radius';
export * from './shadows';
export * from './spacing';
export * from './typography';

import { colors } from './colors';
import { zIndex } from './elevation';
import { radius } from './radius';
import { shadows } from './shadows';
import { breakpoints, spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight } from './typography';

export const theme = {
  colors,
  spacing,
  breakpoints,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  radius,
  shadows,
  zIndex,
} as const;

export type Theme = typeof theme;
