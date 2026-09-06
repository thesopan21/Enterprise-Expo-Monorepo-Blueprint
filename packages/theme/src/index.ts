export * from './colors.js';
export * from './elevation.js';
export * from './radius.js';
export * from './shadows.js';
export * from './spacing.js';
export * from './typography.js';

import { colors } from './colors.js';
import { zIndex } from './elevation.js';
import { radius } from './radius.js';
import { shadows } from './shadows.js';
import { breakpoints, spacing } from './spacing.js';
import { fontFamily, fontSize, fontWeight, lineHeight } from './typography.js';

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
