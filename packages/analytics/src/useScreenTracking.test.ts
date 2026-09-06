import { renderHook } from "@testing-library/react-native";
import { usePathname } from "expo-router";

import type { AnalyticsClient } from "./types";
import { useScreenTracking } from "./useScreenTracking";

jest.mock("expo-router", () => ({
  usePathname: jest.fn(),
}));

function createMockClient(): AnalyticsClient {
  return {
    track: jest.fn(),
    screen: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  };
}

describe("useScreenTracking", () => {
  it("calls .screen() with the current pathname on mount", async () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const client = createMockClient();

    await renderHook(() => useScreenTracking(client));

    expect(client.screen).toHaveBeenCalledTimes(1);
    expect(client.screen).toHaveBeenCalledWith("/home", undefined);
  });

  it("calls .screen() again when the pathname changes", async () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const client = createMockClient();

    const { rerender } = await renderHook(() => useScreenTracking(client));

    (usePathname as jest.Mock).mockReturnValue("/profile");
    await rerender({});

    expect(client.screen).toHaveBeenCalledTimes(2);
    expect(client.screen).toHaveBeenNthCalledWith(2, "/profile", undefined);
  });

  it("does not call .screen() again when the pathname is unchanged", async () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const client = createMockClient();

    const { rerender } = await renderHook(() => useScreenTracking(client, { source: "tab" }));
    await rerender({});

    expect(client.screen).toHaveBeenCalledTimes(1);
    expect(client.screen).toHaveBeenCalledWith("/home", { source: "tab" });
  });
});
