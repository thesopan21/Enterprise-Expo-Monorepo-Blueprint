import { noopAnalyticsClient } from "./noopAnalyticsClient";

describe("noopAnalyticsClient", () => {
  it("never throws for any interface method", () => {
    expect(() => noopAnalyticsClient.track("event", { a: 1 })).not.toThrow();
    expect(() => noopAnalyticsClient.screen("Home", { a: 1 })).not.toThrow();
    expect(() => noopAnalyticsClient.identify("user-1", { a: 1 })).not.toThrow();
    expect(() => noopAnalyticsClient.reset()).not.toThrow();
  });

  it("never throws when called with no optional arguments", () => {
    expect(() => noopAnalyticsClient.track("event")).not.toThrow();
    expect(() => noopAnalyticsClient.screen("Home")).not.toThrow();
    expect(() => noopAnalyticsClient.identify("user-1")).not.toThrow();
  });
});
