import { palette, theme } from '@workspace/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Typography } from '../Typography/Typography';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type BadgeProps = ViewProps & {
  label: string;
  variant?: BadgeVariant;
};

const variantStyles = StyleSheet.create({
  neutral: { backgroundColor: palette.neutral[100] },
  success: { backgroundColor: palette.success[500] },
  warning: { backgroundColor: palette.warning[500] },
  danger: { backgroundColor: palette.danger[500] },
  info: { backgroundColor: palette.info[500] },
});

const labelColors: Record<BadgeVariant, string> = {
  neutral: palette.neutral[900],
  success: palette.neutral[0],
  warning: palette.neutral[0],
  danger: palette.neutral[0],
  info: palette.neutral[0],
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },
});

export function Badge({ label, variant = 'neutral', style, ...rest }: BadgeProps) {
  return (
    <View
      accessibilityRole="text"
      style={[styles.badge, variantStyles[variant], style]}
      {...rest}
    >
      <Typography variant="caption" color={labelColors[variant]}>
        {label}
      </Typography>
    </View>
  );
}
