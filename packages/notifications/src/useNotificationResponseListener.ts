import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import type { NotificationPayload } from "./types";

// Fires when the user interacts with a delivered notification (typically a
// tap). Use `response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER`
// to distinguish a plain tap from a custom notification action.
export function useNotificationResponseListener<
  TPayload extends NotificationPayload = NotificationPayload,
>(onResponse: (payload: TPayload, response: Notifications.NotificationResponse) => void): void {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      onResponse(response.notification.request.content.data as TPayload, response);
    });
    return () => subscription.remove();
  }, [onResponse]);
}
