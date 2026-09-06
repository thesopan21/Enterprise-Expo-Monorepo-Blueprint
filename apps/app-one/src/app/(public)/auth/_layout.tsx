import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeftIcon
} from 'phosphor-react-native';
import { Pressable } from 'react-native';

export default function AuthLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '600', fontSize: 18, color: '#1A1A1A' },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingRight: 16 }]}
          >
            <ArrowLeftIcon size={24} color="#1A1A1A" />
          </Pressable>
        ),
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: 'Sign In',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Create Account'
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Reset Password',
          presentation: 'card'
        }}
      />
    </Stack>
  );
}
