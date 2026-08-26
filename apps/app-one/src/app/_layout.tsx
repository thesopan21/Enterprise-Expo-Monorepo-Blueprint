import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import {
  AuthProvider,
  useAuth
} from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationRouter />
    </AuthProvider>
  );
}

function NavigationRouter() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Protect the entire public group tree */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>

      {/* Protect the entire authenticated group tree */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      {/* Global Modals layout overlay */}
      <Stack.Screen
        name="modal/help-center"
        options={{ presentation: 'modal', headerShown: true, title: 'Help Center' }}
      />
    </Stack>
  );
}
