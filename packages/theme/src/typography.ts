// Family keys match the font files bundled in apps/app-one/assets/fonts;
// loading them via expo-font/useFonts is the consuming app's responsibility.
export const fontFamily = {
  light: "PlusJakartaSans-Light",
  regular: "PlusJakartaSans-Regular",
  medium: "PlusJakartaSans-Medium",
  semiBold: "PlusJakartaSans-SemiBold",
  bold: "PlusJakartaSans-Bold",
  display: "ShortStack-Regular",
} as const;

export const fontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 36,
  "4xl": 48,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  md: 26,
  lg: 28,
  xl: 32,
  "2xl": 38,
  "3xl": 44,
  "4xl": 56,
} as const;

export type FontSizeToken = keyof typeof fontSize;
