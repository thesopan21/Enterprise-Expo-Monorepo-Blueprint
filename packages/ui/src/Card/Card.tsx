import { theme } from '@workspace/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export type CardProps = ViewProps;

const colors = theme.colors.light;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    ...theme.shadows.sm,
  },
});

export function Card({ style, ...rest }: CardProps) {
  return <View style={[styles.card, style]} {...rest} />;
}
