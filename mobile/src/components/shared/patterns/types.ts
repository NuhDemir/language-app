/**
 * Shared Pattern Types
 * Common types for all pattern-based components
 */

export type PatternType = "dots" | "lines" | "grid" | "waves" | "mesh" | "circles";

export type PatternIntensity = "low" | "medium" | "high";

export interface PatternBackgroundProps {
    patternType: PatternType;
    primaryColor: string;
    secondaryColor: string;
    width: number;
    height: number;
    intensity?: PatternIntensity;
    animated?: boolean;
}

export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
}

export interface PatternConfig {
    type: PatternType;
    density: number;
    opacity: number;
    animated: boolean;
}

/**
 * Intensity to opacity mapping
 */
export const INTENSITY_OPACITY: Record<PatternIntensity, number> = {
    low: 0.08,
    medium: 0.15,
    high: 0.25,
};
