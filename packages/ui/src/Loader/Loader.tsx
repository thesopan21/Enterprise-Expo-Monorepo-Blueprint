import { theme } from "@workspace/theme";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";

export type LoaderProps = Omit<ActivityIndicatorProps, "accessibilityLabel"> & {
  accessibilityLabel?: string;
};

export function Loader({
  size = "small",
  color = theme.colors.light.primary,
  accessibilityLabel = "Loading",
  ...rest
}: LoaderProps) {
  return (
    <ActivityIndicator
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      size={size}
      color={color}
      {...rest}
    />
  );
}
