import { renderHook } from "@testing-library/react-native";

import { useIsMounted } from "./useIsMounted";

describe("useIsMounted", () => {
  it("returns true while mounted", async () => {
    const { result } = await renderHook(() => useIsMounted());

    expect(result.current()).toBe(true);
  });

  it("returns false after unmount", async () => {
    const { result, unmount } = await renderHook(() => useIsMounted());

    await unmount();

    expect(result.current()).toBe(false);
  });
});
