/**
 * PatternBackground Component (Shared)
 * Strategy pattern implementation for rendering different patterns
 * Reusable across all card components
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PatternBackgroundProps, PatternType } from "../types";

// Pattern imports
import { DotsPattern } from "./patterns/DotsPattern";
import { LinesPattern } from "./patterns/LinesPattern";
import { GridPattern } from "./patterns/GridPattern";
import { WavesPattern } from "./patterns/WavesPattern";
import { MeshPattern } from "./patterns/MeshPattern";
import { CirclesPattern } from "./patterns/CirclesPattern";

/**
 * Pattern strategy map
 * Open/Closed Principle: Easy to add new patterns
 */
const PATTERN_COMPONENTS: Record<
  PatternType,
  React.ComponentType<PatternBackgroundProps>
> = {
  dots: DotsPattern,
  lines: LinesPattern,
  grid: GridPattern,
  waves: WavesPattern,
  mesh: MeshPattern,
  circles: CirclesPattern,
};

interface PatternBackgroundContainerProps extends PatternBackgroundProps {
  borderRadius?: number;
}

const PatternBackgroundComponent: React.FC<PatternBackgroundContainerProps> = ({
  patternType,
  primaryColor,
  secondaryColor,
  width,
  height,
  intensity = "medium",
  animated = false,
  borderRadius = 24,
}) => {
  // Select pattern component based on type
  const PatternComponent = PATTERN_COMPONENTS[patternType];

  // Helper to convert hex color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number): string => {
    // Remove # if present
    hex = hex.replace("#", "");

    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Create gradient colors with proper rgba format
  const gradientColors: [string, string, string] = [
    hexToRgba(primaryColor, 0.08),
    hexToRgba(secondaryColor, 0.05),
    hexToRgba(primaryColor, 0.03),
  ];

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
      ]}
    >
      {/* Base gradient background */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Pattern overlay */}
      <PatternComponent
        patternType={patternType}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        width={width}
        height={height}
        intensity={intensity}
        animated={animated}
      />

      {/* Subtle vignette effect */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

export const PatternBackground = React.memo(PatternBackgroundComponent);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
  },
});
