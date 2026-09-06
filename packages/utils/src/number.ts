const DEFAULT_LOCALE = 'en-IN';

export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`clamp: min (${min}) must not be greater than max (${max})`);
  }
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
