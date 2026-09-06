import { theme } from '@workspace/theme';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

export type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

const baseStyle = StyleSheet.create({
  text: {
    color: theme.colors.light.textPrimary,
  },
});

const variantStyles = StyleSheet.create({
  display: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize['4xl'],
    lineHeight: theme.lineHeight['4xl'],
  },
  h1: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize['3xl'],
    lineHeight: theme.lineHeight['3xl'],
  },
  h2: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: theme.fontSize['2xl'],
    lineHeight: theme.lineHeight['2xl'],
  },
  h3: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: theme.fontSize.xl,
    lineHeight: theme.lineHeight.xl,
  },
  body: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.lineHeight.base,
  },
  bodySmall: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  caption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  label: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
});

export function Typography({ variant = 'body', color, style, ...rest }: TypographyProps) {
  return (
    <Text
      style={[baseStyle.text, variantStyles[variant], color ? { color } : undefined, style]}
      {...rest}
    />
  );
}
