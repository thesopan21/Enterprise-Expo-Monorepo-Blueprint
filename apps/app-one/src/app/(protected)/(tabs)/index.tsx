import { theme } from '@workspace/theme';
import { Button, Typography } from '@workspace/ui';
import { StyleSheet, View } from 'react-native';

import { useSession } from '@/providers/SessionProvider';

export default function HomeScreen() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <Typography variant="body">Home screen.</Typography>
      <Button testID="home-sign-out" label="Sign out" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
  },
});
