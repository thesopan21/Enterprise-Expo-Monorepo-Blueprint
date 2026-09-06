const neutral = {
  0: '#FFFFFF',
  50: '#F8F9FA',
  100: '#F1F3F5',
  200: '#E9ECEF',
  300: '#DEE2E6',
  400: '#CED4DA',
  500: '#ADB5BD',
  600: '#868E96',
  700: '#495057',
  800: '#343A40',
  900: '#212529',
  1000: '#000000',
} as const;

const brand = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
} as const;

const success = { 500: '#2F9E44', 600: '#2B8A3E' } as const;
const warning = { 500: '#F08C00', 600: '#E8590C' } as const;
const danger = { 500: '#E03131', 600: '#C92A2A' } as const;
const info = { 500: '#1971C2', 600: '#1864AB' } as const;

export const palette = { neutral, brand, success, warning, danger, info } as const;

export const lightColors = {
  background: neutral[0],
  surface: neutral[50],
  border: neutral[200],
  textPrimary: neutral[900],
  textSecondary: neutral[700],
  textDisabled: neutral[500],
  primary: brand[600],
  onPrimary: neutral[0],
  success: success[500],
  warning: warning[500],
  danger: danger[500],
  info: info[500],
} as const;

export const darkColors = {
  background: neutral[900],
  surface: neutral[800],
  border: neutral[700],
  textPrimary: neutral[0],
  textSecondary: neutral[300],
  textDisabled: neutral[600],
  primary: brand[400],
  onPrimary: neutral[900],
  success: success[500],
  warning: warning[500],
  danger: danger[500],
  info: info[500],
} as const;

export type ThemeColorScheme = typeof lightColors;

export const colors = { light: lightColors, dark: darkColors } as const;
