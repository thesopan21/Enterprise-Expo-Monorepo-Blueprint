import { theme } from "@workspace/theme";
import type { Icon } from "phosphor-react-native";
import { Pressable, StyleSheet, type PressableProps } from "react-native";

export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  icon: Icon;
  accessibilityLabel: string;
  size?: IconButtonSize;
  disabled?: boolean;
};

const colors = theme.colors.light;

const dimensions: Record<IconButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

const iconSizes: Record<IconButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  disabled: {
    opacity: 0.5,
  },
});

export function IconButton({
  icon: IconComponent,
  accessibilityLabel,
  size = "md",
  disabled = false,
  onPress,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.base,
        { width: dimensions[size], height: dimensions[size] },
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <IconComponent size={iconSizes[size]} color={colors.textPrimary} />
    </Pressable>
  );
}
