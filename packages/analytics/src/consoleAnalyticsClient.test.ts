import { consoleAnalyticsClient } from "./consoleAnalyticsClient";

describe("consoleAnalyticsClient", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("never throws for any interface method", () => {
    expect(() => consoleAnalyticsClient.track("event", { a: 1 })).not.toThrow();
    expect(() => consoleAnalyticsClient.screen("Home", { a: 1 })).not.toThrow();
    expect(() => consoleAnalyticsClient.identify("user-1", { a: 1 })).not.toThrow();
    expect(() => consoleAnalyticsClient.reset()).not.toThrow();
  });

  it("logs every call it makes", () => {
    consoleAnalyticsClient.track("sign_in", { method: "password" });
    consoleAnalyticsClient.screen("Home");
    consoleAnalyticsClient.identify("user-1", { plan: "free" });
    consoleAnalyticsClient.reset();

    expect(logSpy).toHaveBeenCalledTimes(4);
    expect(logSpy).toHaveBeenNthCalledWith(1, "[analytics] track", "sign_in", {
      method: "password",
    });
    expect(logSpy).toHaveBeenNthCalledWith(2, "[analytics] screen", "Home", {});
    expect(logSpy).toHaveBeenNthCalledWith(3, "[analytics] identify", "user-1", { plan: "free" });
    expect(logSpy).toHaveBeenNthCalledWith(4, "[analytics] reset");
  });
});
