import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Typography, Spacing, Radius } from "../../styles";

interface SafeHeaderProps {
  /** Başlık metni */
  title: string;
  /** Geri butonu gösterilsin mi */
  showBackButton?: boolean;
  /** Özel geri işlevi */
  onBackPress?: () => void;
  /** Sağ taraftaki render prop */
  rightAction?: React.ReactNode;
  /** Header arka plan rengi */
  backgroundColor?: string;
  /** Transparent header (gradient üzerinde kullanım için) */
  transparent?: boolean;
  /** Alt border gösterilsin mi */
  showBorder?: boolean;
}

const HEADER_HEIGHT = 56;

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightAction,
  backgroundColor,
  transparent = false,
  showBorder = true,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const bgColor = transparent
    ? "transparent"
    : backgroundColor || Theme.background.paper;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: bgColor,
          borderBottomWidth:
            showBorder && !transparent ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: Theme.border.subtle,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left Action */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={[
                styles.backButton,
                transparent && styles.backButtonTransparent,
              ]}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={transparent ? Theme.text.primary : Theme.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text
            style={[styles.title, transparent && styles.titleTransparent]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right Action */}
        <View style={styles.rightSection}>
          {rightAction || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

/** Header yüksekliğini hesapla (safe area dahil) */
export const useHeaderHeight = (): number => {
  const insets = useSafeAreaInsets();
  return insets.top + HEADER_HEIGHT;
};

/** Header yüksekliği sabiti */
export const SAFE_HEADER_HEIGHT = HEADER_HEIGHT;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 100,
  },
  content: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.m,
  },
  leftSection: {
    width: 48,
    alignItems: "flex-start",
  },
  titleSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.s,
  },
  rightSection: {
    width: 48,
    alignItems: "flex-end",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.circle,
    backgroundColor: Theme.background.app,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonTransparent: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  title: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.bold,
    color: Theme.text.primary,
    textAlign: "center",
  },
  titleTransparent: {
    color: Theme.text.primary,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});
