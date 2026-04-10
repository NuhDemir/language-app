import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Radius, Spacing } from "../../styles";

type IconContainerVariant = "default" | "filled" | "outlined";

interface IconProps extends ViewProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  containerVariant?: IconContainerVariant;
  containerColor?: string;
}

/**
 * Icon bileşeni
 * Ionicons ile ikon render eder.
 *
 * @example
 * <Icon name="heart" size={24} color="red" />
 * <Icon name="settings" containerVariant="filled" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  containerVariant = "default",
  containerColor,
  style,
  ...props
}) => {
  const iconColor = color || Theme.text.primary;

  if (containerVariant === "default") {
    return <Ionicons name={name} size={size} color={iconColor} />;
  }

  const containerSize = size + Spacing.l;
  const bgColor = containerColor || Theme.primary.main;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor:
            containerVariant === "filled" ? bgColor : "transparent",
          borderWidth: containerVariant === "outlined" ? 1 : 0,
          borderColor: bgColor,
        },
        style,
      ]}
      {...props}
    >
      <Ionicons
        name={name}
        size={size}
        color={containerVariant === "filled" ? Theme.text.inverse : iconColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Icon;
