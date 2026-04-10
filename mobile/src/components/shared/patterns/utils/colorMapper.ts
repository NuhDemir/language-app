/**
 * Color Mapper Utility (Shared)
 * Maps tags/labels to color schemes using deterministic algorithm
 */

import { Palette } from "../../../styles";
import type { ColorScheme } from "../types";

const COLOR_PALETTES: ColorScheme[] = [
    {
        primary: Palette.violetPrimary,
        secondary: Palette.violetLight,
        accent: "#8B5CF6",
    },
    {
        primary: "#06B6D4",
        secondary: "#22D3EE",
        accent: "#0891B2",
    },
    {
        primary: "#10B981",
        secondary: "#34D399",
        accent: "#059669",
    },
    {
        primary: "#F59E0B",
        secondary: "#FBBF24",
        accent: "#D97706",
    },
    {
        primary: "#EF4444",
        secondary: "#F87171",
        accent: "#DC2626",
    },
    {
        primary: "#8B5CF6",
        secondary: "#A78BFA",
        accent: "#7C3AED",
    },
    {
        primary: "#EC4899",
        secondary: "#F472B6",
        accent: "#DB2777",
    },
    {
        primary: "#6366F1",
        secondary: "#818CF8",
        accent: "#4F46E5",
    },
];

const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

export const getColorSchemeForTag = (label: string): ColorScheme => {
    const hash = hashString(label);
    const index = hash % COLOR_PALETTES.length;
    return COLOR_PALETTES[index];
};

export const createGradientColors = (
    scheme: ColorScheme
): [string, string, string] => {
    return [scheme.primary, scheme.secondary, scheme.primary];
};

export const getContrastColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#FFFFFF";
};
