// src/features/courses/components/MapSkeleton.tsx
// Loading skeleton for the map screen

import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MapSkeleton: React.FC = () => {
  // Simple pulse animation for skeleton
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const renderUnitSkeleton = (key: number) => (
    <View key={`unit-${key}`}>
      {/* Unit Header Skeleton */}
      <Animated.View 
        style={[
          styles.unitHeader, 
          { opacity: pulseAnim }
        ]} 
      />
      
      {/* Level Nodes Skeleton */}
      {[0, 1, 2, 3].map((i) => (
        <View key={`level-${key}-${i}`} style={styles.nodeRow}>
          <View style={[styles.pathLine, { opacity: 0.3 }]} />
          <Animated.View 
            style={[
              styles.nodeCircle,
              { 
                marginLeft: getRandomOffset(i),
                opacity: pulseAnim,
              }
            ]} 
          />
        </View>
      ))}
    </View>
  );

  const getRandomOffset = (index: number): number => {
    const offsets = [
      SCREEN_WIDTH / 2 - 32,
      SPACING.lg,
      SCREEN_WIDTH / 2 - 32,
      SCREEN_WIDTH - 64 - SPACING.lg,
    ];
    return offsets[index % offsets.length];
  };

  return (
    <View style={styles.container}>
      {[1, 2].map(renderUnitSkeleton)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  unitHeader: {
    height: 80,
    backgroundColor: COLORS.neutral.surface,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  nodeRow: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  pathLine: {
    width: 4,
    height: 24,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  nodeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.neutral.surface,
  },
});
