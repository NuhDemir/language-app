import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Theme, Typography, Spacing, Layout } from "../../styles";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailInfoRowProps {
  /** Sol ikon adı (Ionicons) */
  icon: keyof typeof Ionicons.glyphMap;
  /** Etiket metni */
  label: string;
  /** Değer metni */
  value: string;
  /** Opsiyonel ikon rengi */
  iconColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ICON_SIZE = 18;

// ─── Component ────────────────────────────────────────────────────────────────

export const DetailInfoRow: React.FC<DetailInfoRowProps> = ({
  icon,
  label,
  value,
  iconColor,
}) => {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={ICON_SIZE}
        color={iconColor ?? Theme.primary.main}
      />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    ...Layout.row,
    alignItems: "center",
    gap: Spacing.s,
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.captionSmall,
    lineHeight: Typography.lineHeight.captionSmall,
    color: Theme.text.secondary,
    width: 80,
  },
  value: {
    flex: 1,
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodyMedium,
    lineHeight: Typography.lineHeight.bodyMedium,
    color: Theme.text.primary,
  },
});
