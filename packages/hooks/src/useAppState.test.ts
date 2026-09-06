import { act, renderHook } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";

import { useAppState } from "./useAppState";

function mockAppStateListener(initialState: AppStateStatus) {
  Object.defineProperty(AppState, "currentState", {
    configurable: true,
    value: initialState,
  });

  let listener: ((status: AppStateStatus) => void) | undefined;
  const remove = jest.fn();

  jest.spyOn(AppState, "addEventListener").mockImplementation(((
    eventName: string,
    handler: (status: AppStateStatus) => void,
  ) => {
    if (eventName === "change") {
      listener = handler;
    }
    return { remove };
  }) as typeof AppState.addEventListener);

  return {
    emit: async (status: AppStateStatus) => {
      await act(async () => {
        listener?.(status);
      });
    },
    remove,
  };
}

describe("useAppState", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("starts with the current AppState value", async () => {
    mockAppStateListener("active");

    const { result } = await renderHook(() => useAppState());

    expect(result.current).toBe("active");
  });

  it("updates when the app state changes", async () => {
    const { emit } = mockAppStateListener("active");

    const { result } = await renderHook(() => useAppState());
    await emit("background");

    expect(result.current).toBe("background");
  });

  it("removes its listener on unmount", async () => {
    const { remove } = mockAppStateListener("active");

    const { unmount } = await renderHook(() => useAppState());
    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
