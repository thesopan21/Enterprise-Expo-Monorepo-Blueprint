import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFFFFF' }, // Uniform global background color
      }}
    >
      {/* Starting point for anonymous users */}
      <Stack.Screen name="welcome" />

      {/* Nested authentication subsystem stack screens */}
      <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
