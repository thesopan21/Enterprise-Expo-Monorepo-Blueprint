import { renderHook } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";

import { useNotificationResponseListener } from "./useNotificationResponseListener";

jest.mock("expo-notifications", () => ({
  addNotificationResponseReceivedListener: jest.fn(),
}));

describe("useNotificationResponseListener", () => {
  it("calls the handler with the response notification's data payload", async () => {
    let capturedListener: ((response: unknown) => void) | undefined;
    const remove = jest.fn();
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
      (listener) => {
        capturedListener = listener;
        return { remove };
      },
    );
    const onResponse = jest.fn();
    const response = {
      actionIdentifier: "expo.modules.notifications.actions.DEFAULT",
      notification: { request: { content: { data: { orderId: "1" } } } },
    };

    await renderHook(() => useNotificationResponseListener(onResponse));
    capturedListener?.(response);

    expect(onResponse).toHaveBeenCalledWith({ orderId: "1" }, response);
  });

  it("removes its subscription on unmount", async () => {
    const remove = jest.fn();
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
      remove,
    });

    const { unmount } = await renderHook(() => useNotificationResponseListener(jest.fn()));
    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
