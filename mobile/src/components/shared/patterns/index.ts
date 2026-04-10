/**
 * Shared Patterns Library
 * Reusable pattern components for all cards
 */

// Main component
export { PatternBackground } from "./components/PatternBackground";

// Types
export type {
    PatternType,
    PatternIntensity,
    PatternBackgroundProps,
    ColorScheme,
    PatternConfig,
} from "./types";

// Hooks
export { usePatternColors } from "./hooks/usePatternColors";

// Utils
export {
    getColorSchemeForTag,
    createGradientColors,
    getContrastColor,
} from "./utils/colorMapper";

export {
    selectPatternForTag,
    getPatternConfig,
    createPatternConfig,
} from "./utils/patternSelector";
