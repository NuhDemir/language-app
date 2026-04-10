// src/features/courses/components/LevelCard.tsx
// Main level card component for course map - displays level progress

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Info } from 'lucide-react-native';

import { COLORS, SPACING, FONT_SIZES, RADIUS, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import type { CourseMapLevel, LevelStatus } from '../types';

import { CircularProgress } from './CircularProgress';
import { LevelStats } from './LevelStats';
import { StatusBadge } from './StatusBadge';
import { StartLessonButton } from './StartLessonButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface LevelCardProps {
  level: CourseMapLevel;
  variant: 'active' | 'completed' | 'locked' | 'next';
  onStartLesson: (levelId: string) => void;
  onInfoPress?: (levelId: string) => void;
}

// ============================================================================
// ACTIVE LEVEL CARD (Large Card)
// ============================================================================

interface ActiveLevelCardProps {
  level: CourseMapLevel;
  onStartLesson: (levelId: string) => void;
  onInfoPress?: (levelId: string) => void;
}

const ActiveLevelCard: React.FC<ActiveLevelCardProps> = memo(({
  level,
  onStartLesson,
  onInfoPress,
}) => {
  const handleStart = useCallback(() => {
    onStartLesson(level.id);
  }, [level.id, onStartLesson]);

  const handleInfo = useCallback(() => {
    onInfoPress?.(level.id);
  }, [level.id, onInfoPress]);

  return (
    <View style={styles.activeCard}>
      {/* Header Row */}
      <View style={styles.activeHeader}>
        <StatusBadge status={level.status} />
        <TouchableOpacity onPress={handleInfo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Info size={isTablet ? 24 : 20} color={COLORS.neutral.body} />
        </TouchableOpacity>
      </View>

      {/* Title - Format: LEVEL 4: */}
      <AppText style={styles.activeTitle}>
        LEVEL {level.unitOrderIndex}:
      </AppText>
      {/* Subtitle - Unit name split into lines */}
      <AppText style={styles.activeSubtitle}>{level.unitTitle}</AppText>

      {/* Circular Progress - Centered */}
      <View style={styles.progressContainer}>
        <CircularProgress
          progress={level.progress}
          size="md"
          color={COLORS.primary.main}
          backgroundColor={COLORS.neutral.border}
        />
      </View>

      {/* Stats Row */}
      <LevelStats
        completedLessons={level.completedLessons}
        totalLessons={level.totalLessons}
        xpEarned={level.xpEarned}
        timeSpentMinutes={level.timeSpentMinutes}
        accuracy={level.accuracy}
      />

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <StartLessonButton
          onPress={handleStart}
          label={level.completedLessons > 0 ? 'CONTINUE' : 'START LESSON'}
        />
      </View>
    </View>
  );
});

ActiveLevelCard.displayName = 'ActiveLevelCard';

// ============================================================================
// COMPLETED LEVEL CARD (Small Card)
// ============================================================================

interface CompletedLevelCardProps {
  level: CourseMapLevel;
  onPress: (levelId: string) => void;
}

const CompletedLevelCard: React.FC<CompletedLevelCardProps> = memo(({
  level,
  onPress,
}) => {
  const handlePress = useCallback(() => {
    onPress(level.id);
  }, [level.id, onPress]);

  return (
    <TouchableOpacity style={styles.completedCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.completedIcon}>
        <AppText style={styles.completedCheckmark}>✓</AppText>
      </View>
      <AppText style={styles.completedText}>
        Level {level.unitOrderIndex}.{level.orderIndex}: Completed
      </AppText>
    </TouchableOpacity>
  );
});

CompletedLevelCard.displayName = 'CompletedLevelCard';

// ============================================================================
// NEXT/LOCKED LEVEL CARD (Preview Card with Blur Effect)
// ============================================================================

interface NextLevelCardProps {
  level: CourseMapLevel;
}

const NextLevelCard: React.FC<NextLevelCardProps> = memo(({ level }) => (
  <View style={styles.nextCard}>
    <View style={styles.nextOverlay} />
    <View style={styles.nextContent}>
      <AppText style={styles.nextTitle}>
        LEVEL {level.unitOrderIndex}.{level.orderIndex}: {level.unitTitle}
      </AppText>
      <View style={styles.nextIconContainer}>
        <AppText style={styles.lockedIcon}>🔒</AppText>
      </View>
    </View>
  </View>
));

NextLevelCard.displayName = 'NextLevelCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LevelCardComponent: React.FC<LevelCardProps> = ({
  level,
  variant,
  onStartLesson,
  onInfoPress,
}) => {
  switch (variant) {
    case 'active':
      return (
        <ActiveLevelCard
          level={level}
          onStartLesson={onStartLesson}
          onInfoPress={onInfoPress}
        />
      );
    case 'completed':
      return <CompletedLevelCard level={level} onPress={onStartLesson} />;
    case 'next':
    case 'locked':
      return <NextLevelCard level={level} />;
    default:
      return null;
  }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Active Card (Large)
  activeCard: {
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.xl,
    padding: isTablet ? SPACING.xl : SPACING.lg,
    marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
    marginVertical: SPACING.md,
    shadowColor: COLORS.primary.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activeTitle: {
    fontFamily: FONTS.heading,
    fontSize: isTablet ? FONT_SIZES.xxl : FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginBottom: SPACING.xs,
  },
  activeSubtitle: {
    fontFamily: FONTS.heading,
    fontSize: isTablet ? FONT_SIZES.xxxl : FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    lineHeight: isTablet ? 42 : 34,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: isTablet ? SPACING.xl : SPACING.lg,
  },
  buttonContainer: {
    marginTop: isTablet ? SPACING.xl : SPACING.lg,
  },

  // Completed Card (Small)
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.surface,
    borderRadius: RADIUS.lg,
    padding: isTablet ? SPACING.md : SPACING.sm + 4,
    marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  completedIcon: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  completedCheckmark: {
    color: '#FFFFFF',
    fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
    fontWeight: '700',
  },
  completedText: {
    fontFamily: FONTS.medium,
    fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.success.text,
    flex: 1,
  },

  // Next/Locked Card (Preview)
  nextCard: {
    borderRadius: RADIUS.xl,
    marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
    marginVertical: SPACING.md,
    overflow: 'hidden',
    height: isTablet ? 140 : 120,
    backgroundColor: COLORS.primary.main,
  },
  nextOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  nextContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  nextTitle: {
    fontFamily: FONTS.heading,
    fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  nextIconContainer: {
    marginTop: SPACING.sm,
  },
  lockedIcon: {
    fontSize: isTablet ? 32 : 28,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export const LevelCard = memo(LevelCardComponent);
