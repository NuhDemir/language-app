/**
 * Inventory Theme
 * Light ve Dark mode için renk şemaları
 */

import { Palette } from './colors';

export const InventoryTheme = {
    light: {
        background: Palette.offWhite,
        surface: Palette.white,
        surfaceVariant: Palette.slate100,
        primary: Palette.violetPrimary,
        primaryDim: Palette.violetDark,
        secondary: Palette.violetLight,
        tertiary: Palette.teal,
        outline: Palette.slate300,
        outlineVariant: Palette.slate200,
        onSurface: Palette.slate900,
        onSurfaceVariant: Palette.slate600,

        // Timeline specific
        timelineGradient: [Palette.violetPrimary, Palette.violetLight, Palette.slate300],

        // Card specific
        cardBackground: Palette.white,
        cardBorder: Palette.slate200,
        cardShadow: 'rgba(0, 0, 0, 0.08)',

        // Active state
        activeGradient: [Palette.violetPrimary, Palette.violetLight],
        activeBorder: 'rgba(88, 114, 244, 0.2)',
        activeGlow: 'rgba(88, 114, 244, 0.08)',

        // Completed state
        completedColor: Palette.teal,
        completedShadow: 'rgba(43, 181, 160, 0.3)',

        // Locked state
        lockedColor: Palette.slate400,
        lockedBackground: Palette.slate50,
    },

    dark: {
        background: Palette.darkBackground,
        surface: Palette.darkSurface,
        surfaceVariant: Palette.darkSurfaceVariant,
        primary: Palette.darkPrimary,
        primaryDim: Palette.darkPrimaryDim,
        secondary: Palette.darkSecondary,
        tertiary: Palette.darkTertiary,
        outline: Palette.darkOutline,
        outlineVariant: Palette.darkOutlineVariant,
        onSurface: Palette.darkOnSurface,
        onSurfaceVariant: Palette.darkOnSurfaceVariant,

        // Timeline specific
        timelineGradient: [Palette.darkTertiary, Palette.darkPrimary, Palette.darkOutline],

        // Card specific
        cardBackground: Palette.darkSurface,
        cardBorder: 'rgba(151, 169, 255, 0.2)',
        cardShadow: 'rgba(0, 0, 0, 0.3)',

        // Active state
        activeGradient: [Palette.darkPrimary, Palette.darkSecondary],
        activeBorder: 'rgba(151, 169, 255, 0.2)',
        activeGlow: 'rgba(191, 129, 255, 0.1)',

        // Completed state
        completedColor: Palette.darkTertiary,
        completedShadow: 'rgba(161, 250, 255, 0.6)',

        // Locked state
        lockedColor: Palette.darkOutline,
        lockedBackground: 'transparent',
    },
} as const;

export type ThemeMode = 'light' | 'dark';

export const getInventoryTheme = (mode: ThemeMode = 'light') => {
    return InventoryTheme[mode];
};
