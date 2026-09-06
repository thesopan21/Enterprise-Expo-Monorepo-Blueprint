import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("formats INR with the default locale/currency", () => {
    expect(formatCurrency(1234.5)).toBe("₹1,234.50");
  });

  it("formats a given currency and locale", () => {
    expect(formatCurrency(1234.5, "USD", "en-US")).toBe("$1,234.50");
  });

  it("throws for a non-finite amount", () => {
    expect(() => formatCurrency(Number.NaN)).toThrow(RangeError);
    expect(() => formatCurrency(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
