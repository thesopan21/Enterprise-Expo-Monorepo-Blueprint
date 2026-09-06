import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Root of protected area points directly to tabs */}
      <Stack.Screen name="(tabs)" />

      {/* Standard stacked sub-routes with sliding header titles */}
      <Stack.Screen name="settings" options={{ headerShown: true, title: "Account Settings" }} />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: "Activity" }} />
    </Stack>
  );
}
