import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  Edge,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Theme, Spacing, Layout } from "../../styles";

type SafeEdge = "top" | "bottom" | "left" | "right";

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  /** Arka plan rengi */
  backgroundColor?: string;
  /** Hangi kenarlar için safe area uygulanacak */
  edges?: SafeEdge[];
  /** Yatay padding eklensin mi */
  withPadding?: boolean;
  /** StatusBar stili */
  statusBarStyle?: "light" | "dark" | "auto";
  /** StatusBar gizli mi */
  statusBarHidden?: boolean;
}

/**
 * Tüm ekranlar için tutarlı SafeArea wrapper
 *
 * @example
 * // Tam ekran (üst-alt safe area)
 * <ScreenWrapper edges={["top", "bottom"]}>
 *
 * // Sadece alt safe area (üstte custom header varsa)
 * <ScreenWrapper edges={["bottom"]}>
 *
 * // Safe area yok (full bleed)
 * <ScreenWrapper edges={[]}>
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor,
  edges = ["top", "bottom"],
  withPadding = false,
  statusBarStyle = "dark",
  statusBarHidden = false,
  style,
  ...props
}) => {
  const bgColor = backgroundColor || Theme.background.app;

  return (
    <SafeAreaView
      edges={edges as Edge[]}
      style={[styles.container, { backgroundColor: bgColor }, style]}
      {...props}
    >
      <StatusBar
        style={statusBarStyle}
        backgroundColor={bgColor}
        hidden={statusBarHidden}
      />
      <View style={[Layout.flex1, withPadding && styles.contentPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

/**
 * Safe area insets hook - manuel kullanım için
 */
export const useSafeInsets = useSafeAreaInsets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: Spacing.screen.paddingHorizontal,
  },
});
