import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Theme, Spacing, Typography, Radius, Shadows } from "../../../styles";

interface QuickAccessCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onPress: () => void;
  backgroundColor?: string;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  title,
  description,
  icon,
  onPress,
  backgroundColor = Theme.primary.light,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.l,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.small,
    minHeight: 80,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.m,
    backgroundColor: Theme.background.paper,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.bodyLarge,
    color: Theme.text.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodySmall,
    color: Theme.text.secondary,
  },
});
