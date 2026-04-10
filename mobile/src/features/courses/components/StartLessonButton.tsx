// src/features/courses/components/StartLessonButton.tsx
// Animated start lesson button with icon

import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Play } from 'lucide-react-native';

import { COLORS, SPACING, FONT_SIZES, RADIUS, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface StartLessonButtonProps {
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  label?: string;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

const StartLessonButtonComponent: React.FC<StartLessonButtonProps> = ({
  onPress,
  disabled = false,
  variant = 'primary',
  label = 'START LESSON',
  style,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const isPrimary = variant === 'primary';
  const backgroundColor = disabled
    ? COLORS.neutral.locked
    : isPrimary
      ? COLORS.primary.main
      : 'transparent';
  const borderColor = isPrimary ? 'transparent' : COLORS.primary.main;
  const textColor = disabled
    ? '#FFFFFF'
    : isPrimary
      ? '#FFFFFF'
      : COLORS.primary.main;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.shadow,
        {
          backgroundColor,
          borderColor,
          borderWidth: isPrimary ? 0 : 2,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <AppText style={[styles.label, { color: textColor }]}>{label}</AppText>
      <Play
        size={isTablet ? 20 : 18}
        color={textColor}
        fill={textColor}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? SPACING.md + 4 : SPACING.md,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  shadow: {
    shadowColor: COLORS.primary.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontFamily: FONTS.heading,
    fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  icon: {
    marginLeft: SPACING.xs,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export const StartLessonButton = memo(StartLessonButtonComponent);
