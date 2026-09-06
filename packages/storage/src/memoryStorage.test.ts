import { memoryStorage } from "./memoryStorage";

describe("memoryStorage", () => {
  afterEach(() => {
    memoryStorage.clear();
  });

  it("returns null for a key that was never set", () => {
    expect(memoryStorage.get("missing")).toBeNull();
  });

  it("round-trips primitive and object values", () => {
    memoryStorage.set("count", 3);
    memoryStorage.set("user", { id: "u1", name: "Ada" });

    expect(memoryStorage.get("count")).toBe(3);
    expect(memoryStorage.get("user")).toEqual({ id: "u1", name: "Ada" });
  });

  it("overwrites an existing value on set", () => {
    memoryStorage.set("key", "first");
    memoryStorage.set("key", "second");

    expect(memoryStorage.get("key")).toBe("second");
  });

  it("removes a value on delete", () => {
    memoryStorage.set("key", "value");
    memoryStorage.delete("key");

    expect(memoryStorage.get("key")).toBeNull();
  });

  it("removes every value on clear", () => {
    memoryStorage.set("a", 1);
    memoryStorage.set("b", 2);
    memoryStorage.clear();

    expect(memoryStorage.get("a")).toBeNull();
    expect(memoryStorage.get("b")).toBeNull();
  });
});
