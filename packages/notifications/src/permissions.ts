import * as Notifications from "expo-notifications";

import type { NotificationPermissionStatus } from "./types";

function toPermissionStatus(status: Notifications.PermissionStatus): NotificationPermissionStatus {
  switch (status) {
    case Notifications.PermissionStatus.GRANTED:
      return "granted";
    case Notifications.PermissionStatus.DENIED:
      return "denied";
    default:
      return "undetermined";
  }
}

// No user-facing prompt — safe to call anytime to check the current state.
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const result = await Notifications.getPermissionsAsync();
  return toPermissionStatus(result.status);
}

// Prompts the user. On Android, permission is granted by default and the
// user cannot be re-prompted after declining — this still resolves with
// whatever expo-notifications reports, it just won't show a second prompt.
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  const result = await Notifications.requestPermissionsAsync();
  return toPermissionStatus(result.status);
}
