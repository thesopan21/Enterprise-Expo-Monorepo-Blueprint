import { isNotEmpty, isValidEmail, isValidUrl, isWithinLength } from "./validation";

describe("isValidEmail", () => {
  it.each(["user@example.com", "a.b+c@sub.example.co.in"])("accepts %s", (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each(["", "not-an-email", "user@", "@example.com", "user example.com"])(
    "rejects %s",
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );
});

describe("isValidUrl", () => {
  it.each(["https://example.com", "http://localhost:3000/path?query=1"])("accepts %s", (value) => {
    expect(isValidUrl(value)).toBe(true);
  });

  it.each(["", "not a url", "example.com"])("rejects %s", (value) => {
    expect(isValidUrl(value)).toBe(false);
  });
});

describe("isNotEmpty", () => {
  it("rejects an empty or whitespace-only string", () => {
    expect(isNotEmpty("")).toBe(false);
    expect(isNotEmpty("   ")).toBe(false);
  });

  it("accepts a non-empty string", () => {
    expect(isNotEmpty("hello")).toBe(true);
  });
});

describe("isWithinLength", () => {
  it("accepts a value within the bounds (trimmed)", () => {
    expect(isWithinLength("  hello  ", 3, 10)).toBe(true);
  });

  it("rejects a value shorter than the minimum", () => {
    expect(isWithinLength("ab", 3, 10)).toBe(false);
  });

  it("rejects a value longer than the maximum", () => {
    expect(isWithinLength("a very long value", 3, 10)).toBe(false);
  });
});
