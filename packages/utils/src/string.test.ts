import { capitalize, slugify, truncate } from "./string";

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });

  it("does not change the rest of the string", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });
});

describe("truncate", () => {
  it("returns the original string when within maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and appends the default suffix when too long", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
  });

  it("truncates with a custom suffix", () => {
    expect(truncate("hello world", 8, "...")).toBe("hello...");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("collapses punctuation and repeated separators", () => {
    expect(slugify("  Hello,   World!!  ")).toBe("hello-world");
  });

  it("strips accents", () => {
    expect(slugify("Café Münster")).toBe("cafe-munster");
  });
});
