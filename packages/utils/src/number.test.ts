import { clamp, formatNumber, roundTo } from "./number";

describe("clamp", () => {
  it("returns the value when within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to the minimum", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to the maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("throws when min is greater than max", () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
  });
});

describe("roundTo", () => {
  it("rounds to the given number of decimals", () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.2355, 2)).toBe(1.24);
  });

  it("rounds to zero decimals", () => {
    expect(roundTo(1.5, 0)).toBe(2);
  });
});

describe("formatNumber", () => {
  it("formats with the default locale", () => {
    expect(formatNumber(1234567)).toBe("12,34,567");
  });

  it("formats with a given locale and options", () => {
    expect(formatNumber(0.5, { style: "percent" }, "en-US")).toBe("50%");
  });
});
