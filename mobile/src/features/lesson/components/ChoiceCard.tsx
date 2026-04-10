// src/features/lesson/components/ChoiceCard.tsx
// Gamified choice card with 4 states: idle, selected, correct, wrong
// Uses React.memo to prevent unnecessary re-renders

import React, { memo, useMemo, useCallback, useRef } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';

import { COLORS, RADIUS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { ChoiceState } from '../types';
import { playSelectionFeedback } from '../utils';

interface ChoiceCardProps {
  text: string;
  state: ChoiceState;
  disabled: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ChoiceCardComponent: React.FC<ChoiceCardProps> = ({
  text,
  state,
  disabled,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  // Memoized style calculation based on state
  // This prevents recalculating styles for every render
  const stateStyles = useMemo(() => {
    switch (state) {
      case 'selected':
        return {
          backgroundColor: COLORS.primary.light,
          borderColor: COLORS.primary.main,
          textColor: COLORS.primary.light,
        };
      case 'correct':
        return {
          backgroundColor: COLORS.success.main,
          borderColor: COLORS.success.shadow,
          textColor: '#FFFFFF',
        };
      case 'wrong':
        return {
          backgroundColor: COLORS.error.main,
          borderColor: COLORS.error.shadow,
          textColor: '#FFFFFF',
        };
      case 'idle':
      default:
        return {
          backgroundColor: COLORS.neutral.surface,
          borderColor: COLORS.neutral.border,
          textColor: COLORS.neutral.title,
        };
    }
  }, [state]);

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    // Animate press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 15,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    playSelectionFeedback();

    // Call parent handler
    onPress();
  }, [onPress, scale]);

  // Container style with state colors
  const containerStyle: ViewStyle = useMemo(() => ({
    backgroundColor: stateStyles.backgroundColor,
    borderColor: stateStyles.borderColor,
  }), [stateStyles]);

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        containerStyle,
        { transform: [{ scale }] }
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {/* 3D Shadow Effect */}
      {state === 'idle' && <Animated.View style={styles.shadowLayer} />}

      {/* Content */}
      <AppText
        style={[
          styles.text,
          { color: stateStyles.textColor }
        ]}
      >
        {text}
      </AppText>

      {/* Correct/Wrong Indicator */}
      {state === 'correct' && (
        <AppText style={styles.indicator}>✓</AppText>
      )}
      {state === 'wrong' && (
        <AppText style={styles.indicator}>✗</AppText>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    minHeight: 56,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    bottom: -3,
    backgroundColor: COLORS.neutral.border,
    borderRadius: RADIUS.lg,
    zIndex: -1,
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    flex: 1,
  },
  indicator: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
});

// Memoize to prevent re-renders when parent state changes
// Only re-render when props actually change
export const ChoiceCard = memo(ChoiceCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.state === nextProps.state &&
    prevProps.disabled === nextProps.disabled
  );
});
