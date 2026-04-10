import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Spacing, Typography } from "../../../styles";
import Streak from "../../../../assets/icons/home/Streak.svg";

interface HeaderProps {
  streak: number;
  onSearchPress: () => void;
  profileImageUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  onSearchPress,
  profileImageUrl,
}) => {
  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <TouchableOpacity style={styles.profileContainer}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Ionicons name="person" size={24} color={Theme.text.secondary} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.rightActions}>
        {/* Streak */}
        <View style={styles.streakContainer}>
          <Streak width={24} height={24} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>

        {/* Search Icon */}
        <TouchableOpacity
          onPress={onSearchPress}
          style={styles.searchButton}
          accessibilityLabel="Arama"
          accessibilityRole="button"
        >
          <Ionicons name="search" size={24} color={Theme.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
  },
  profileContainer: {
    width: 48,
    height: 48,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.background.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  streakText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.bodyLarge,
    color: Theme.text.primary,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
