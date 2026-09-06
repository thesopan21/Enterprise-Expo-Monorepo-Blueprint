import { breakpoints, colors, radius, shadows, spacing, zIndex } from "./index";

describe("colors", () => {
  it.each(["light", "dark"] as const)(
    "%s scheme has a value for every semantic token",
    (scheme) => {
      for (const value of Object.values(colors[scheme])) {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    },
  );
});

describe("spacing", () => {
  it("is monotonically increasing as keys grow", () => {
    const entries = Object.entries(spacing)
      .map(([key, value]) => [Number(key), value] as const)
      .sort((a, b) => a[0] - b[0]);

    for (let i = 1; i < entries.length; i += 1) {
      expect(entries[i]![1]).toBeGreaterThan(entries[i - 1]![1]);
    }
  });

  it("breakpoints are monotonically increasing from sm to xl", () => {
    expect(breakpoints.sm).toBeLessThan(breakpoints.md);
    expect(breakpoints.md).toBeLessThan(breakpoints.lg);
    expect(breakpoints.lg).toBeLessThan(breakpoints.xl);
  });
});

describe("radius", () => {
  it("every step has a non-negative value", () => {
    for (const value of Object.values(radius)) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("shadows", () => {
  it("every preset defines the full shadow + elevation shape", () => {
    for (const preset of Object.values(shadows)) {
      expect(preset).toHaveProperty("shadowColor");
      expect(preset).toHaveProperty("shadowOffset.width");
      expect(preset).toHaveProperty("shadowOffset.height");
      expect(preset).toHaveProperty("shadowOpacity");
      expect(preset).toHaveProperty("shadowRadius");
      expect(preset).toHaveProperty("elevation");
    }
  });
});

describe("zIndex", () => {
  it("has no duplicate stacking values", () => {
    const values = Object.values(zIndex);
    expect(new Set(values).size).toBe(values.length);
  });
});
