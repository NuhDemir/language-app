/**
 * FilterModal · components/ui
 *
 * Aranabilir, filtrelenebilir liste modal'ı.
 * Global BottomSheet bileşenini wrapper olarak kullanır.
 * Çarpı yok — sadece tutamaçtan sürükleyerek veya dışarı tıklayarak kapanır.
 */

import React, { useCallback } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Theme,
  Palette,
  Typography as TypoTokens,
  Spacing,
  Radius,
} from "../../styles";
import { BottomSheet } from "./BottomSheet";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEARCH_ICON = 18;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterModalProps {
  visible: boolean;
  title: string;
  count?: number;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  onClose: () => void;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FilterModalComponent: React.FC<FilterModalProps> = ({
  visible,
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Ara...",
  onClose,
  children,
}) => {
  const handleClearSearch = useCallback(() => {
    onSearchChange?.("");
  }, [onSearchChange]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      count={count}
      heightPercent={0.88}
    >
      {/* ── Search ── */}
      {onSearchChange !== undefined && (
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={SEARCH_ICON}
            color={Theme.text.disabled}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={Theme.text.disabled}
            value={searchValue}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchValue != null && searchValue.length > 0 && (
            <Pressable
              onPress={handleClearSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={SEARCH_ICON}
                color={Theme.text.disabled}
              />
            </Pressable>
          )}
        </View>
      )}

      {/* ── Content (FlatList etc.) ── */}
      {children}
    </BottomSheet>
  );
};

export const FilterModal = React.memo(FilterModalComponent);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.l,
    marginBottom: Spacing.m,
    paddingHorizontal: Spacing.m,
    paddingVertical: Platform.OS === "ios" ? Spacing.s + 2 : Spacing.s,
    backgroundColor: Palette.slate50,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: Spacing.s,
  },
  searchInput: {
    flex: 1,
    fontFamily: TypoTokens.family.regular,
    fontSize: TypoTokens.size.bodyMedium,
    lineHeight: TypoTokens.lineHeight.bodyMedium,
    color: Theme.text.primary,
    paddingVertical: 0,
  },
});
