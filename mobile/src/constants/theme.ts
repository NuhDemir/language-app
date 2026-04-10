/**
 * Theme Constants
 * Legacy compatibility layer for old theme system
 * Maps new styles system to old constant names
 */

import { Platform } from 'react-native';
import { Theme, Typography, Spacing, Radius } from '../styles';

// Legacy COLORS mapping
export const COLORS = {
  primary: {
    main: Theme.primary.main,
    light: Theme.primary.light,
    dark: Theme.primary.dark,
    shadow: Theme.clay.shadow,
  },
  secondary: {
    main: Theme.secondary.main,
    light: Theme.secondary.light,
  },
  success: {
    main: Theme.success.main,
    bg: Theme.success.light,
    text: Theme.success.main,
    shadow: Theme.success.dark,
  },
  error: {
    main: Theme.error.main,
    bg: Theme.error.light,
    text: Theme.error.main,
    shadow: Theme.error.dark,
  },
  warning: {
    main: Theme.status.warning,
  },
  neutral: {
    bg: Theme.background.app,
    surface: Theme.background.paper,
    title: Theme.text.primary,
    body: Theme.text.secondary,
    border: Theme.border.subtle,
    locked: Theme.text.disabled,
    lockedShadow: Theme.text.disabled,
  },
  gold: {
    main: '#FFD700',
    bg: '#FFF9E6',
  },
};

// Legacy SPACING mapping
export const SPACING = {
  xs: Spacing.xs,
  sm: Spacing.s,
  md: Spacing.m,
  lg: Spacing.l,
  xl: Spacing.xl,
  xxl: Spacing.xxl,
};

// Legacy FONT_SIZES mapping
export const FONT_SIZES = {
  xs: Typography.size.captionTiny,
  sm: Typography.size.captionSmall,
  md: Typography.size.bodyMedium,
  lg: Typography.size.bodyLarge,
  xl: Typography.size.h3,
  xxl: Typography.size.h2,
  xxxl: Typography.size.h1,
};

// Legacy RADIUS mapping
export const RADIUS = {
  xs: Radius.xs,
  sm: Radius.s,
  md: Radius.m,
  lg: Radius.l,
  xl: Radius.xl,
  xxl: Radius.xxl,
  full: Radius.pill,
};

// Legacy FONTS mapping
export const FONTS = {
  body: Typography.family.regular,
  medium: Typography.family.medium,
  heading: Typography.family.bold,
  semiBold: Typography.family.semiBold,
  bold: Typography.family.bold,
};

// Keep original exports for backward compatibility
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
