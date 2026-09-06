import { theme } from "@workspace/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider, useSession } from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Keys must match @workspace/theme's fontFamily values exactly — that's
  // what every Typography variant's `fontFamily` style resolves to. Without
  // this, RN silently falls back to the platform default font instead of
  // erroring, so the whole design system's typography would render wrong
  // with no visible error — caught during Phase 20's performance review.
  const [fontsLoaded, fontError] = useFonts({
    [theme.fontFamily.light]: require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
    [theme.fontFamily.regular]: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    [theme.fontFamily.medium]: require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    [theme.fontFamily.semiBold]: require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    [theme.fontFamily.bold]: require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    [theme.fontFamily.display]: require("../../assets/fonts/ShortStack-Regular.ttf"),
  });

  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <NavigationRouter fontsReady={fontsLoaded || Boolean(fontError)} />
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

function NavigationRouter({ fontsReady }: { fontsReady: boolean }) {
  const { isAuthenticated, isLoading } = useSession();
  const ready = fontsReady && !isLoading;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Protect the entire public group tree */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>

      {/* Protect the entire authenticated group tree */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  );
}
