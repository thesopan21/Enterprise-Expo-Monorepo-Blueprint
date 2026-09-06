const DEFAULT_LOCALE = "en-IN";
const DEFAULT_CURRENCY = "INR";

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError(`formatCurrency: amount must be a finite number, got ${String(amount)}`);
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
