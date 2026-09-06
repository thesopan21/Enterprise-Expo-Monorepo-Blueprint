import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import type { NotificationPayload } from "./types";

// Fires whenever a notification is received while the app is running
// (foreground or background, per expo-notifications' own delivery rules).
export function useNotificationListener<TPayload extends NotificationPayload = NotificationPayload>(
  onNotification: (payload: TPayload, notification: Notifications.Notification) => void,
): void {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      onNotification(notification.request.content.data as TPayload, notification);
    });
    return () => subscription.remove();
  }, [onNotification]);
}
