import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { Theme, Spacing, Radius, Shadows } from "../../styles";

type CardVariant = "default" | "elevated" | "outlined";

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: number;
}

/**
 * Card bileşeni
 * İçerik gruplamak için kullanılan container.
 *
 * @example
 * <Card variant="elevated">
 *   <Typography>Kart içeriği</Typography>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = Spacing.l,
  children,
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "elevated":
        return Shadows.medium;
      case "outlined":
        return {
          borderWidth: 1,
          borderColor: Theme.border.subtle,
        };
      default:
        return Shadows.small;
    }
  };

  return (
    <View
      style={[styles.card, { padding }, getVariantStyle(), style]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.background.paper,
    borderRadius: Radius.xl,
  },
});

export default Card;
