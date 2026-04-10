/**
 * RandomPatternBackground Component (Shared)
 *
 * Responsive modular background using PatternBackground system
 * Each card gets a random pattern based on unique ID for visual variety
 *
 * Features:
 * - Random pattern selection (seeded by ID for consistency)
 * - Optional shimmer animation
 * - Optional decorative corner circle
 * - Fully responsive
 * - Configurable colors
 */

import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { PatternBackground } from "../patterns/components/PatternBackground";
import type { PatternType } from "../patterns/types";
import { Palette } from "../../../styles";

interface RandomPatternBackgroundProps {
  width: number;
  height?: number;
  uniqueId?: string | number; // Used for consistent random pattern per card
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
  showShimmer?: boolean;
  shimmerColor?: string;
  showCornerCircle?: boolean;
  cornerCircleColor?: string;
  borderRadius?: number;
}

// Available pattern types
const PATTERN_TYPES: PatternType[] = [
  "dots",
  "lines",
  "grid",
  "waves",
  "mesh",
  "circles",
];

/**
 * Seeded random number generator for consistent patterns per card
 */
const seededRandom = (seed: string | number): number => {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const RandomPatternBackground: React.FC<
  RandomPatternBackgroundProps
> = ({
  width,
  height = 280,
  uniqueId,
  primaryColor = Palette.violetPrimary,
  secondaryColor = Palette.violetLight,
  intensity = "low",
  animated = true,
  showShimmer = true,
  shimmerColor = "rgba(88,114,244,0.08)",
  showCornerCircle = true,
  cornerCircleColor = "rgba(88,114,244,0.06)",
  borderRadius = 24,
}) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const { width: screenWidth } = useWindowDimensions();

    // Get random pattern based on uniqueId (consistent per card)
    const patternType = useMemo(() => {
      if (uniqueId) {
        const randomIndex = seededRandom(uniqueId) % PATTERN_TYPES.length;
        return PATTERN_TYPES[randomIndex];
      }
      // Fallback to truly random if no uniqueId
      return PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];
    }, [uniqueId]);

    // Responsive calculations
    const isSmallScreen = screenWidth < 375;
    const shimmerWidth = width * (isSmallScreen ? 0.3 : 0.38);
    const circleSize = isSmallScreen ? 140 : 160;
    const circleOffset = isSmallScreen ? -50 : -60;

    useEffect(() => {
      if (!showShimmer) return;

      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }, [showShimmer]);

    const shimmerTranslate = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, width * 1.4],
    });

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Pattern overlay using shared pattern system - Random per card */}
        <PatternBackground
          patternType={patternType}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          width={width}
          height={height}
          intensity={intensity}
          animated={animated}
          borderRadius={borderRadius}
        />

        {/* Shimmer effect */}
        {showShimmer && (
          <Animated.View
            style={[
              s.shimmer,
              {
                width: shimmerWidth,
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          >
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: shimmerColor }]}
            />
          </Animated.View>
        )}

        {/* Decorative corner circle */}
        {showCornerCircle && (
          <View
            style={[
              s.cornerCircle,
              {
                top: circleOffset,
                right: circleOffset,
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                backgroundColor: cornerCircleColor,
              },
            ]}
          />
        )}
      </View>
    );
  };

const s = StyleSheet.create({
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    opacity: 0.5,
  },
  cornerCircle: {
    position: "absolute",
  },
});
