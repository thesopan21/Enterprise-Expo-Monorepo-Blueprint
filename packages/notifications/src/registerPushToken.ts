import * as Notifications from "expo-notifications";

import { requestNotificationPermission } from "./permissions";

export interface RegisterPushTokenOptions {
  // Defaults to Constants.expoConfig.extra.eas.projectId (see
  // apps/app-one/app.json — currently a REPLACE_WITH_EAS_PROJECT_ID
  // placeholder per Phase 15, so registration fails until a real EAS
  // project exists, same as that phase's known risk).
  projectId?: string;
}

// Requests permission if needed, then fetches an Expo push token. Fails
// loudly with a clear message rather than a cryptic native error when run
// without a Development Build or a configured EAS project — the same
// discipline Phases 6/7 established for MMKV and SecureStore in Expo Go.
export async function registerForPushNotifications(
  options: RegisterPushTokenOptions = {},
): Promise<string> {
  const status = await requestNotificationPermission();
  if (status !== "granted") {
    throw new Error(
      "[@workspace/notifications] Notification permission was not granted; cannot register " +
        "for push notifications.",
    );
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync(
      options.projectId ? { projectId: options.projectId } : undefined,
    );
    return token.data;
  } catch (error) {
    throw new Error(
      "[@workspace/notifications] Failed to register for push notifications. This requires a " +
        "Development Build (not Expo Go) and a real EAS project ID configured in app.json's " +
        "extra.eas.projectId. See packages/notifications/README.md.",
      { cause: error },
    );
  }
}
