/**
 * DetailScreenShell · components/layout
 *
 * Company ve Experience detay ekranları için yeniden kullanılabilir iskelet.
 * Üstte sabit header (geri butonu + başlık + opsiyonel sağ aksiyon),
 * altında hero alanı (logo/kapak görseli) ve ScrollView içerik alanı.
 *
 * Variant desteği:
 *   - "default" → Klasik hero + content yapısı (Company için)
 *   - "profile" → Profil bazlı layout — hero yerine children alanı serbest
 *                  (Experience redesign için)
 *
 * Composable yapıda: children ile içerik, headerProps ile başlık kontrolü,
 * heroContent ile üst bölge render prop olarak yönetilir.
 *
 * @example
 * <DetailScreenShell
 *   headerTitle="Trendyol"
 *   accentColor="#FF5C00"
 *   heroContent={<CompanyHero ... />}
 *   onBack={navigation.goBack}
 * >
 *   <Text>Detay içeriği</Text>
 * </DetailScreenShell>
 *
 * @example (profile variant)
 * <DetailScreenShell
 *   variant="profile"
 *   headerTitle="Frontend Developer"
 *   onBack={navigation.goBack}
 * >
 *   <ProfileHeader ... />
 *   <ProfileInfo ... />
 * </DetailScreenShell>
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenWrapper } from "./ScreenWrapper";
import {
  Theme,
  Typography,
  Spacing,
  Radius,
  Layout,
  Shadows,
} from "../../styles";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACK_BUTTON_SIZE = 40;
const ICON_SIZE = 22;

// ─── Types ────────────────────────────────────────────────────────────────────

type DetailScreenVariant = "default" | "profile";

interface DetailScreenShellProps {
  /** Layout varyantı */
  variant?: DetailScreenVariant;
  /** Ekran başlığı (header'da gösterilir) */
  headerTitle: string;
  /** Geri butonu handler'ı */
  onBack: () => void;
  /** Opsiyonel accent/brand rengi — header alt çizgi ve badge için */
  accentColor?: string;
  /** Header sağ tarafına yerleştirilecek render prop */
  headerRight?: React.ReactNode;
  /** Hero bölgesi — logo, kapak görseli vb. render prop (default variant) */
  heroContent?: React.ReactNode;
  /** Ekran içeriği */
  children: React.ReactNode;
  /** Yükleniyor durumu — skeleton/spinner gösterir */
  isLoading?: boolean;
  /** ScrollView ref dışarıdan kontrol için (opsiyonel) */
  scrollViewRef?: React.RefObject<ScrollView>;
  /** Header gösterilsin mi (default: true) */
  showHeader?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DetailScreenShell: React.FC<DetailScreenShellProps> = ({
  variant = "default",
  headerTitle,
  onBack,
  accentColor,
  headerRight,
  heroContent,
  children,
  isLoading = false,
  scrollViewRef,
  showHeader = true,
}) => {
  const borderColor = accentColor ?? Theme.primary.main;
  const isProfile = variant === "profile";

  return (
    <ScreenWrapper
      edges={["top", "bottom"]}
      backgroundColor={Theme.background.app}
      statusBarStyle="dark"
    >
      {/* ── Header ────────────────────────────────────────────── */}
      {showHeader && (
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={Spacing.layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
          >
            <Ionicons
              name="chevron-back"
              size={ICON_SIZE}
              color={Theme.text.primary}
            />
          </Pressable>

          {!isProfile && (
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle}
              </Text>
            </View>
          )}

          {isProfile && <View style={Layout.flex1} />}

          <View style={styles.headerRightSlot}>
            {headerRight ?? <View style={styles.headerPlaceholder} />}
          </View>
        </View>
      )}

      {/* ── Accent Divider (default variant only) ─────────────── */}
      {!isProfile && (
        <View style={[styles.accentDivider, { backgroundColor: borderColor }]} />
      )}

      {/* ── Content ───────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={borderColor} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={Layout.flex1}
          contentContainerStyle={
            isProfile ? styles.profileScrollContent : styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Default variant: Hero + Content */}
          {!isProfile && (
            <>
              {heroContent && (
                <View style={styles.heroContainer}>{heroContent}</View>
              )}
              <View style={styles.contentContainer}>{children}</View>
            </>
          )}

          {/* Profile variant: Children direkt yerleşir */}
          {isProfile && children}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.screen.paddingHorizontal,
    paddingVertical: Spacing.s,
    minHeight: Spacing.layout.headerHeight,
  },
  backButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: Radius.circle,
    backgroundColor: Theme.background.paper,
    ...Layout.center,
    ...Shadows.small,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.s,
  },
  headerTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.h3,
    lineHeight: Typography.lineHeight.h3,
    color: Theme.text.primary,
    textAlign: "center",
  },
  headerRightSlot: {
    width: BACK_BUTTON_SIZE,
    alignItems: "flex-end",
  },
  headerPlaceholder: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
  },

  // Accent Divider
  accentDivider: {
    height: 2,
    marginHorizontal: Spacing.screen.paddingHorizontal,
    borderRadius: Radius.circle,
    opacity: 0.4,
  },

  // Content (default variant)
  scrollContent: {
    paddingBottom: Spacing.layout.bottomTabHeight + Spacing.xl,
  },
  heroContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.screen.paddingHorizontal,
  },
  contentContainer: {
    paddingHorizontal: Spacing.screen.paddingHorizontal,
    gap: Spacing.l,
  },

  // Content (profile variant)
  profileScrollContent: {
    paddingBottom: Spacing.layout.bottomTabHeight + Spacing.xl,
  },

  // Loading
  loadingContainer: {
    ...Layout.center,
    flex: 1,
    gap: Spacing.m,
  },
  loadingText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodyMedium,
    color: Theme.text.disabled,
  },
});
