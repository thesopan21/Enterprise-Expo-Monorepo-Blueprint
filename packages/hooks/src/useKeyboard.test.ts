import { act, renderHook } from "@testing-library/react-native";
import { Keyboard, type KeyboardEventListener, type KeyboardEventName } from "react-native";

import { useKeyboard } from "./useKeyboard";

function mockKeyboardListeners() {
  const listeners = new Map<KeyboardEventName, KeyboardEventListener>();
  const removeMocks = new Map<KeyboardEventName, jest.Mock>();

  jest.spyOn(Keyboard, "addListener").mockImplementation(((
    eventName: KeyboardEventName,
    listener: KeyboardEventListener,
  ) => {
    listeners.set(eventName, listener);
    const remove = jest.fn();
    removeMocks.set(eventName, remove);
    return { remove };
  }) as unknown as typeof Keyboard.addListener);

  return {
    emit: async (eventName: KeyboardEventName, event: unknown) => {
      await act(async () => {
        listeners.get(eventName)?.(event as never);
      });
    },
    removeMockFor: (eventName: KeyboardEventName) => removeMocks.get(eventName),
  };
}

describe("useKeyboard", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("starts hidden", async () => {
    mockKeyboardListeners();

    const { result } = await renderHook(() => useKeyboard());

    expect(result.current).toEqual({ isVisible: false, height: 0 });
  });

  it("reports visible with height when the keyboard shows", async () => {
    const { emit } = mockKeyboardListeners();

    const { result } = await renderHook(() => useKeyboard());
    await emit("keyboardDidShow", {
      endCoordinates: { height: 300, screenX: 0, screenY: 0, width: 0 },
    });

    expect(result.current).toEqual({ isVisible: true, height: 300 });
  });

  it("reports hidden with zero height when the keyboard hides", async () => {
    const { emit } = mockKeyboardListeners();

    const { result } = await renderHook(() => useKeyboard());
    await emit("keyboardDidShow", {
      endCoordinates: { height: 300, screenX: 0, screenY: 0, width: 0 },
    });
    await emit("keyboardDidHide", {});

    expect(result.current).toEqual({ isVisible: false, height: 0 });
  });

  it("removes both listeners on unmount", async () => {
    const { removeMockFor } = mockKeyboardListeners();

    const { unmount } = await renderHook(() => useKeyboard());
    await unmount();

    expect(removeMockFor("keyboardDidShow")).toHaveBeenCalledTimes(1);
    expect(removeMockFor("keyboardDidHide")).toHaveBeenCalledTimes(1);
  });
});
