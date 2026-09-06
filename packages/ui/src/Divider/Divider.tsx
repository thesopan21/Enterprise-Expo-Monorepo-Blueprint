import { theme } from '@workspace/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export type DividerProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
};

const colors = theme.colors.light;

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: colors.border,
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
    backgroundColor: colors.border,
  },
});

export function Divider({ orientation = 'horizontal', style, ...rest }: DividerProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles[orientation], style]}
      {...rest}
    />
  );
}
