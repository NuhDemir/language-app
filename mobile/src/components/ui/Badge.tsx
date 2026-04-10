import React from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";
import { Theme, Typography, Spacing, Radius } from "../../styles";

type BadgeVariant = "default" | "success" | "error" | "warning" | "primary";
type BadgeSize = "small" | "medium";

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/**
 * Badge bileşeni
 * Etiket ve durum göstergesi olarak kullanılır.
 *
 * @example
 * <Badge label="Yeni" variant="primary" />
 * <Badge label="Hata" variant="error" size="small" />
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "medium",
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return Theme.primary.light;
      case "success":
        return Theme.status.success + "20"; // %20 opacity
      case "error":
        return Theme.status.error + "20";
      case "warning":
        return Theme.status.warning + "20";
      default:
        return Theme.background.app;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return Theme.primary.dark;
      case "success":
        return Theme.status.success;
      case "error":
        return Theme.status.error;
      case "warning":
        return Theme.status.warning;
      default:
        return Theme.text.secondary;
    }
  };

  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          paddingHorizontal: isSmall ? Spacing.s : Spacing.m,
          paddingVertical: isSmall ? Spacing.xs : Spacing.s,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.label,
          {
            color: getTextColor(),
            fontSize: isSmall
              ? Typography.size.captionTiny
              : Typography.size.captionSmall,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.s,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: Typography.family.medium,
  },
});

export default Badge;
