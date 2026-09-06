const unit = 4;

export const spacing = {
  0: 0,
  1: unit * 1,
  2: unit * 2,
  3: unit * 3,
  4: unit * 4,
  5: unit * 5,
  6: unit * 6,
  8: unit * 8,
  10: unit * 10,
  12: unit * 12,
  16: unit * 16,
  20: unit * 20,
  24: unit * 24,
  32: unit * 32,
  40: unit * 40,
  48: unit * 48,
  64: unit * 64,
} as const;

export type SpacingToken = keyof typeof spacing;

// Viewport width breakpoints (dp), used to switch layout at larger screens
// (tablets, web) rather than to imply CSS-style media query behavior.
export const breakpoints = {
  sm: 360,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
