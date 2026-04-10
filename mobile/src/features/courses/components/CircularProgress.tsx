// src/features/courses/components/CircularProgress.tsx
// Animated circular progress indicator component

import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { COLORS, FONT_SIZES, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface CircularProgressProps {
  /** Progress value between 0 and 100 */
  progress: number;
  /** Size of the circle */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show percentage text */
  showLabel?: boolean;
  /** Stroke color */
  color?: string;
  /** Background stroke color */
  backgroundColor?: string;
  /** Whether to animate */
  animated?: boolean;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    diameter: isTablet ? 80 : 60,
    strokeWidth: isTablet ? 6 : 5,
    fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
    labelSize: isTablet ? FONT_SIZES.xs : 10,
    containerSize: isTablet ? 100 : 80,
  },
  md: {
    diameter: isTablet ? 160 : 140,
    strokeWidth: isTablet ? 10 : 8,
    fontSize: isTablet ? FONT_SIZES.xxxl : 42,
    labelSize: isTablet ? FONT_SIZES.sm : FONT_SIZES.xs,
    containerSize: isTablet ? 200 : 180,
  },
  lg: {
    diameter: isTablet ? 200 : 180,
    strokeWidth: isTablet ? 12 : 10,
    fontSize: isTablet ? 52 : 46,
    labelSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
    containerSize: isTablet ? 240 : 220,
  },
};

// ============================================================================
// ANIMATED CIRCLE
// ============================================================================

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================================================
// COMPONENT
// ============================================================================

const CircularProgressComponent: React.FC<CircularProgressProps> = ({
  progress,
  size = 'md',
  showLabel = true,
  color = COLORS.primary.main,
  backgroundColor = COLORS.neutral.border,
  animated = true,
}) => {
  const config = SIZE_CONFIG[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(0)).current;

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  // Outer container size for white background
  const containerSize = config.containerSize;

  return (
    <View style={[
      styles.outerContainer,
      {
        width: containerSize,
        height: containerSize,
        borderRadius: containerSize / 2,
      }
    ]}>
      <View style={[styles.container, { width: config.diameter, height: config.diameter }]}>
        <Svg width={config.diameter} height={config.diameter}>
          <G rotation="-90" origin={`${config.diameter / 2}, ${config.diameter / 2}`}>
            {/* Background Circle */}
            <Circle
              cx={config.diameter / 2}
              cy={config.diameter / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={config.strokeWidth}
              fill="transparent"
            />
            {/* Progress Circle */}
            <AnimatedCircle
              cx={config.diameter / 2}
              cy={config.diameter / 2}
              r={radius}
              stroke={color}
              strokeWidth={config.strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center Label */}
        {showLabel && (
          <View style={styles.labelContainer}>
            <View style={styles.percentageRow}>
              <AppText style={[styles.percentage, { fontSize: config.fontSize }]}>
                {Math.round(clampedProgress)}
              </AppText>
              <AppText style={[styles.percentSign, { fontSize: config.labelSize + 4 }]}>%</AppText>
            </View>
            <AppText style={[styles.completeLabel, { fontSize: config.labelSize }]}>
              COMPLETE
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  percentage: {
    fontFamily: FONTS.heading,
    fontWeight: '700',
    color: COLORS.neutral.title,
    lineHeight: undefined,
  },
  percentSign: {
    fontFamily: FONTS.heading,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginTop: 4,
  },
  completeLabel: {
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: COLORS.neutral.body,
    marginTop: 2,
    letterSpacing: 1,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export const CircularProgress = memo(CircularProgressComponent);
