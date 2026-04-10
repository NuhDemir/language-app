import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Typography, Spacing, Layout } from "../../styles";
import { Typography as Text } from "../ui/Typography";

interface EmptyStateProps extends ViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

/**
 * EmptyState bileşeni
 * Boş liste veya veri olmadığında gösterilir.
 *
 * @example
 * <EmptyState
 *   icon="folder-open-outline"
 *   title="Henüz veri yok"
 *   description="Yeni bir öğe ekleyerek başlayın"
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "folder-open-outline",
  title,
  description,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <Ionicons name={icon} size={64} color={Theme.text.disabled} />
      <Text variant="h3" color="secondary" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="bodyMedium" color="disabled" align="center">
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginTop: Spacing.l,
    marginBottom: Spacing.s,
  },
});

export default EmptyState;
