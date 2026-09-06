import { Typography } from '@workspace/ui';
import { View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body">Account settings.</Typography>
    </View>
  );
}
