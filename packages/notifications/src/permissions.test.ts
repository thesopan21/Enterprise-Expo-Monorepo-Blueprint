import * as Notifications from "expo-notifications";

import { getNotificationPermissionStatus, requestNotificationPermission } from "./permissions";

jest.mock("expo-notifications", () => ({
  PermissionStatus: { GRANTED: "granted", DENIED: "denied", UNDETERMINED: "undetermined" },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

describe("getNotificationPermissionStatus", () => {
  it.each([
    ["granted", "granted"],
    ["denied", "denied"],
    ["undetermined", "undetermined"],
  ])("maps a %s expo-notifications status to %s", async (nativeStatus, expected) => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: nativeStatus });

    await expect(getNotificationPermissionStatus()).resolves.toBe(expected);
  });

  it("treats any unrecognized status as undetermined", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "unknown" });

    await expect(getNotificationPermissionStatus()).resolves.toBe("undetermined");
  });
});

describe("requestNotificationPermission", () => {
  it("returns the mapped status after prompting", async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });

    await expect(requestNotificationPermission()).resolves.toBe("granted");
  });
});
