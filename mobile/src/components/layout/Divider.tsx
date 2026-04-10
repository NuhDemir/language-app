import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { Theme, Spacing } from "../../styles";

interface DividerProps extends ViewProps {
  color?: string;
  thickness?: number;
  spacing?: number;
}

/**
 * Divider bileşeni
 * İçerik arasına görsel ayırıcı çizgi ekler.
 *
 * @example
 * <Divider />                           // Varsayılan
 * <Divider thickness={2} spacing={24} /> // Kalın ve geniş boşluklu
 */
export const Divider: React.FC<DividerProps> = ({
  color,
  thickness = 1,
  spacing = Spacing.l,
  style,
  ...props
}) => {
  const dividerColor = color || Theme.border.subtle;

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: dividerColor,
          height: thickness,
          marginVertical: spacing,
        },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: "100%",
  },
});

export default Divider;
