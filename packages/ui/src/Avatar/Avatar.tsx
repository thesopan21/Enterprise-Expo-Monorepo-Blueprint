import { palette } from "@workspace/theme";
import type { Icon } from "phosphor-react-native";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";

import { Typography } from "../Typography/Typography";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  label: string;
  source?: ImageSourcePropType;
  icon?: Icon;
  size?: AvatarSize;
};

const dimensions: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

const iconSizes: Record<AvatarSize, number> = {
  sm: 16,
  md: 20,
  lg: 28,
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.brand[100],
    overflow: "hidden",
  },
});

function initialsFrom(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function Avatar({ label, source, icon: IconComponent, size = "md" }: AvatarProps) {
  const dimension = dimensions[size];
  const containerStyle = [
    styles.base,
    { width: dimension, height: dimension, borderRadius: dimension / 2 },
  ];

  if (source) {
    return (
      <View accessibilityRole="image" accessibilityLabel={label} style={containerStyle}>
        <Image source={source} style={{ width: dimension, height: dimension }} />
      </View>
    );
  }

  if (IconComponent) {
    return (
      <View accessibilityRole="image" accessibilityLabel={label} style={containerStyle}>
        <IconComponent size={iconSizes[size]} color={palette.brand[700]} />
      </View>
    );
  }

  return (
    <View accessibilityRole="image" accessibilityLabel={label} style={containerStyle}>
      <Typography variant="label" color={palette.brand[700]}>
        {initialsFrom(label)}
      </Typography>
    </View>
  );
}
