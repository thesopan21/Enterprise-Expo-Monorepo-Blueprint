import * as Notifications from "expo-notifications";

import { requestNotificationPermission } from "./permissions";
import { registerForPushNotifications } from "./registerPushToken";

jest.mock("./permissions", () => ({
  requestNotificationPermission: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  getExpoPushTokenAsync: jest.fn(),
}));

describe("registerForPushNotifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the token data when permission is granted and the token fetch succeeds", async () => {
    (requestNotificationPermission as jest.Mock).mockResolvedValue("granted");
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: "ExponentPushToken[abc123]",
      type: "expo",
    });

    await expect(registerForPushNotifications()).resolves.toBe("ExponentPushToken[abc123]");
  });

  it("passes a provided projectId through to getExpoPushTokenAsync", async () => {
    (requestNotificationPermission as jest.Mock).mockResolvedValue("granted");
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: "ExponentPushToken[abc123]",
      type: "expo",
    });

    await registerForPushNotifications({ projectId: "my-project-id" });

    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "my-project-id",
    });
  });

  it("throws a clear error without calling getExpoPushTokenAsync when permission is not granted", async () => {
    (requestNotificationPermission as jest.Mock).mockResolvedValue("denied");

    await expect(registerForPushNotifications()).rejects.toThrow(/permission was not granted/i);
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it("wraps a token-fetch failure in a clear, actionable error", async () => {
    (requestNotificationPermission as jest.Mock).mockResolvedValue("granted");
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
      new Error("native module not available"),
    );

    await expect(registerForPushNotifications()).rejects.toThrow(/Development Build/);
  });
});
