import { theme } from '@workspace/theme';
import { Button, Typography } from '@workspace/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing[4],
        gap: theme.spacing[4],
      }}
    >
      <Typography variant="h1">app-one</Typography>
      <Button testID="welcome-sign-in" label="Sign in" onPress={() => router.push('/auth/sign-in')} />
    </View>
  );
}
