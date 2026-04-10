/**
 * DetailSection · components/ui
 *
 * Detay ekranlarındaki bölüm (section) kartı.
 * İçerik gruplarını (Hakkında, Bilgiler, Linkler vb.) görsel olarak ayırır.
 * Hem Company hem Experience detay ekranlarında yeniden kullanılır.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

import {
  Theme,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "../../styles";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailSectionProps {
  /** Bölüm başlığı */
  title?: string;
  /** Bölüm içeriği */
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.background.paper,
    borderRadius: Radius.xl,
    padding: Spacing.l,
    gap: Spacing.m,
    ...Shadows.small,
  },
  sectionTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.bodyLarge,
    lineHeight: Typography.lineHeight.bodyLarge,
    color: Theme.text.primary,
    letterSpacing: -0.3,
  },
});
