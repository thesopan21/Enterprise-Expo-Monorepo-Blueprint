# @workspace/notifications

Push notification permission handling, token registration, and typed
listener hooks, built on `expo-notifications`.

## What this package does _not_ do

**This is client-side only — it is not a complete push solution.** It
covers requesting permission, registering for and returning an Expo push
token, and receiving/reacting to notifications on-device. It does **not**
include a backend: something still has to call
[Expo's push API](https://docs.expo.dev/push-notifications/sending-notifications/)
(or talk to FCM/APNs directly) with the tokens this package returns.
Sending notifications is entirely out of scope here — treat any assumption
that this package alone makes push notifications work end-to-end as a
misunderstanding of what it covers.

## Expo Go vs. Development Build

Local (in-app) notifications work in Expo Go. **Remote push notifications
do not** — `registerForPushNotifications()` requires a
[Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
(Phase 12) on Android, and a real EAS project ID either passed explicitly or
available via `app.json`'s `extra.eas.projectId` (currently a
`REPLACE_WITH_EAS_PROJECT_ID` placeholder per Phase 15, until `eas init` is
run). Calling it without both fails with a clear, actionable error instead
of a cryptic native crash — the same discipline `@workspace/storage`
(MMKV) and `@workspace/auth` (SecureStore) apply for their own
Expo-Go-incompatible native dependencies.

## Usage

```ts
import {
  getNotificationPermissionStatus,
  registerForPushNotifications,
  useNotificationListener,
  useNotificationResponseListener,
} from "@workspace/notifications";
import * as Notifications from "expo-notifications";

// Somewhere after sign-in, on a Development Build:
const status = await getNotificationPermissionStatus();
if (status !== "granted") {
  // requestNotificationPermission() prompts the user
}
const pushToken = await registerForPushNotifications();
// send `pushToken` to your own backend to associate it with this user

// Near the app root:
useNotificationListener((payload) => {
  // payload is typed as NotificationPayload by default — pass your own
  // extended type as the generic argument for stronger typing:
  // useNotificationListener<ChatMessagePayload>((payload) => ...)
});

useNotificationResponseListener((payload, response) => {
  if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    // the user tapped the notification itself
  }
});
```

## Required app-level configuration

This package doesn't touch any consuming app's `app.json` — add the
`expo-notifications` config plugin yourself in whichever app adopts it:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

Then run `expo prebuild` (Phase 12) to regenerate native projects with the
plugin applied.

## Foreground presentation behavior

This package does not call `Notifications.setNotificationHandler()` — that
sets global, app-wide behavior (whether a notification shows a banner/plays
a sound while the app is foregrounded), which belongs in the consuming
app's own startup code, not silently inside a shared package:

```ts
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

## Optional: caching the push token

`registerForPushNotifications()` is stateless — it always re-registers.
If an app wants to avoid redundant re-registration, cache the returned
token with `@workspace/storage` (Phase 6) around your own call site;
this package doesn't force a caching strategy on every consumer.
