import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Spacing, Typography, Radius, Shadows } from "../../../styles";

interface TaskCardProps {
  title: string;
  description: string;
  isCompleted: boolean;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  isCompleted,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completed]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${title} - ${isCompleted ? "Tamamlandı" : "Tamamlanmadı"}`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {isCompleted ? (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={28} color={Theme.success.main} />
          </View>
        ) : (
          <View style={styles.arrowIcon}>
            <Ionicons name="chevron-forward" size={24} color={Theme.text.secondary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.background.paper,
    borderRadius: Radius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    ...Shadows.small,
  },
  completed: {
    opacity: 0.7,
    backgroundColor: Theme.success.light,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.m,
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
  checkIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
