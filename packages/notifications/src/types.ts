export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

// Base shape for a notification's data payload — apps extend this with
// their own fields (e.g. `interface ChatMessagePayload extends
// NotificationPayload { conversationId: string }`) and pass it as the type
// argument to useNotificationListener/useNotificationResponseListener.
export interface NotificationPayload {
  [key: string]: unknown;
}
