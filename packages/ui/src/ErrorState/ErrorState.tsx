import { theme } from '@workspace/theme';
import type { Icon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '../Typography/Typography';

export type ErrorStateProps = {
  icon?: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
};

const colors = theme.colors.light;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[6],
  },
});

export function ErrorState({ icon: IconComponent, title, description, action }: ErrorStateProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      {IconComponent ? <IconComponent size={40} color={colors.danger} /> : null}
      <Typography variant="h3" color={colors.textPrimary}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body" color={colors.textSecondary}>
          {description}
        </Typography>
      ) : null}
      {action}
    </View>
  );
}
