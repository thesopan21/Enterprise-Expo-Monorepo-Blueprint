import { useNetInfo } from "@react-native-community/netinfo";
import { renderHook } from "@testing-library/react-native";

import { useNetworkStatus } from "./useNetworkStatus";

describe("useNetworkStatus", () => {
  it("maps a connected netinfo state to the simplified shape", async () => {
    (useNetInfo as jest.Mock).mockReturnValue({
      type: "wifi",
      isConnected: true,
      isInternetReachable: true,
    });

    const { result } = await renderHook(() => useNetworkStatus());

    expect(result.current).toEqual({ isConnected: true, isInternetReachable: true, type: "wifi" });
  });

  it("treats a null isConnected as false rather than passing it through", async () => {
    (useNetInfo as jest.Mock).mockReturnValue({
      type: "unknown",
      isConnected: null,
      isInternetReachable: null,
    });

    const { result } = await renderHook(() => useNetworkStatus());

    expect(result.current).toEqual({
      isConnected: false,
      isInternetReachable: null,
      type: "unknown",
    });
  });
});
