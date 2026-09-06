import { theme } from "@workspace/theme";
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from "react-native";

import { Typography } from "../Typography/Typography";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
};

const colors = theme.colors.light;

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[3] },
  md: { paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4] },
  lg: { paddingVertical: theme.spacing[4], paddingHorizontal: theme.spacing[5] },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, borderWidth: 0 },
  secondary: { backgroundColor: colors.surface, borderWidth: 0 },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: "transparent", borderWidth: 0 },
  danger: { backgroundColor: colors.danger, borderWidth: 0 },
});

const labelColors: Record<ButtonVariant, string> = {
  primary: colors.onPrimary,
  secondary: colors.textPrimary,
  outline: colors.textPrimary,
  ghost: colors.textPrimary,
  danger: colors.onPrimary,
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    gap: theme.spacing[2],
  },
  disabled: {
    opacity: 0.5,
  },
});

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      style={[styles.base, sizeStyles[size], variantStyles[variant], isDisabled && styles.disabled]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColors[variant]} />
      ) : (
        <Typography variant="label" color={labelColors[variant]}>
          {label}
        </Typography>
      )}
    </Pressable>
  );
}
