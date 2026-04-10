// src/features/courses/components/StatusBadge.tsx
// Status badge component for level cards (IN PROGRESS, COMPLETED, etc.)

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

import { COLORS, SPACING, FONT_SIZES, RADIUS, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import type { LevelStatus } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface StatusBadgeProps {
  status: LevelStatus;
  size?: 'sm' | 'md';
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

interface StatusConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<LevelStatus, StatusConfig> = {
  locked: {
    label: 'LOCKED',
    backgroundColor: COLORS.neutral.locked,
    textColor: '#FFFFFF',
  },
  active: {
    label: 'START',
    backgroundColor: COLORS.primary.main,
    textColor: '#FFFFFF',
  },
  in_progress: {
    label: 'IN PROGRESS',
    backgroundColor: COLORS.primary.light,
    textColor: COLORS.primary.text,
  },
  completed: {
    label: 'COMPLETED',
    backgroundColor: COLORS.success.bg,
    textColor: COLORS.success.text,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

const StatusBadgeComponent: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status];
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: isSm ? SPACING.sm : SPACING.md,
          paddingVertical: isSm ? SPACING.xs : SPACING.xs + 2,
        },
      ]}
    >
      <AppText
        style={[
          styles.label,
          {
            color: config.textColor,
            fontSize: isSm ? 10 : isTablet ? FONT_SIZES.sm : FONT_SIZES.xs,
          },
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export const StatusBadge = memo(StatusBadgeComponent);
