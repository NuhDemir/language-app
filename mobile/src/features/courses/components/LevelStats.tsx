// src/features/courses/components/LevelStats.tsx
// Level statistics display component (Lessons, XP, Time)

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

import { COLORS, SPACING, FONT_SIZES, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface StatItem {
  label: string;
  value: string;
}

interface LevelStatsProps {
  completedLessons: number;
  totalLessons: number;
  xpEarned: number;
  timeSpentMinutes: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// ============================================================================
// STAT ITEM COMPONENT
// ============================================================================

interface StatItemComponentProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const StatItemComponent: React.FC<StatItemComponentProps> = ({ label, value, isLast }) => (
  <View style={[styles.statItem, !isLast && styles.statItemBorder]}>
    <AppText style={styles.statLabel}>{label}</AppText>
    <AppText style={styles.statValue}>{value}</AppText>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LevelStatsComponent: React.FC<LevelStatsProps> = ({
  completedLessons,
  totalLessons,
  xpEarned,
  timeSpentMinutes,
}) => {
  const stats: StatItem[] = [
    { label: 'LESSONS', value: `${completedLessons}/${totalLessons}` },
    { label: 'XP EARNED', value: xpEarned.toString() },
    { label: 'TIME', value: formatTime(timeSpentMinutes) },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <StatItemComponent
          key={stat.label}
          label={stat.label}
          value={stat.value}
          isLast={index === stats.length - 1}
        />
      ))}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: isTablet ? SPACING.lg : SPACING.md,
    marginTop: isTablet ? SPACING.lg : SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral.border,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: isTablet ? FONT_SIZES.sm : FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.neutral.body,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: isTablet ? FONT_SIZES.xl : FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.neutral.title,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export const LevelStats = memo(LevelStatsComponent);
