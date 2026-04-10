// src/features/lesson/components/ProgressBar.tsx
// Animated lesson progress bar

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_HEIGHT = 12;
const BAR_MARGIN = SPACING.lg * 2;

interface ProgressBarProps {
  progress: number; // 0-100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Animate progress changes
  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progress,
      damping: 20,
      stiffness: 100,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  return (
    <View style={styles.container}>
      {/* Background Track */}
      <View style={styles.track}>
        {/* Animated Fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  track: {
    height: BAR_HEIGHT,
    backgroundColor: COLORS.neutral.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.full,
  },
});
