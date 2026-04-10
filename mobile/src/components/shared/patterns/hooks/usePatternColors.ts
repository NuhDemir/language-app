/**
 * usePatternColors Hook (Shared)
 * Generates and memoizes color schemes for patterns
 */

import { useMemo } from "react";
import type { ColorScheme } from "../types";
import {
    getColorSchemeForTag,
    createGradientColors,
} from "../utils/colorMapper";

interface PatternColorsReturn {
    colorScheme: ColorScheme;
    gradientColors: [string, string, string];
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
}

export const usePatternColors = (label: string): PatternColorsReturn => {
    return useMemo(() => {
        const colorScheme = getColorSchemeForTag(label);
        const gradientColors = createGradientColors(colorScheme);

        return {
            colorScheme,
            gradientColors,
            primaryColor: colorScheme.primary,
            secondaryColor: colorScheme.secondary,
            accentColor: colorScheme.accent,
        };
    }, [label]);
};
