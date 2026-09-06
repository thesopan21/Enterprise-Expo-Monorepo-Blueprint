import { renderHook } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";

import { useNotificationListener } from "./useNotificationListener";

jest.mock("expo-notifications", () => ({
  addNotificationReceivedListener: jest.fn(),
}));

describe("useNotificationListener", () => {
  it("calls the handler with the notification's data payload", async () => {
    let capturedListener: ((notification: unknown) => void) | undefined;
    const remove = jest.fn();
    (Notifications.addNotificationReceivedListener as jest.Mock).mockImplementation((listener) => {
      capturedListener = listener;
      return { remove };
    });
    const onNotification = jest.fn();

    await renderHook(() => useNotificationListener(onNotification));
    capturedListener?.({ request: { content: { data: { orderId: "1" } } } });

    expect(onNotification).toHaveBeenCalledWith(
      { orderId: "1" },
      { request: { content: { data: { orderId: "1" } } } },
    );
  });

  it("removes its subscription on unmount", async () => {
    const remove = jest.fn();
    (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove });

    const { unmount } = await renderHook(() => useNotificationListener(jest.fn()));
    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
