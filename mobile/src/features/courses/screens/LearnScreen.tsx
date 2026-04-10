// src/screens/home/LearnScreen.tsx
// Course Map Screen - Responsive & Modular
// Displays course progress with level cards as shown in the design

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ChevronDown } from 'lucide-react-native';

import { COLORS, SPACING, FONT_SIZES, RADIUS, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { useCourseMap } from '../api/useCourseMap';
import { useCourses } from '../api/useCourses';
import { useCourseStore } from '../stores/course.store';
import { CourseMapHeader } from '../components/CourseMapHeader';
import { LevelCard } from '../components/LevelCard';
import { CourseSelectorModal } from '../components/CourseSelectorModal';
import type { CourseMapLevel } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// COMPLETED LEVELS LIST COMPONENT
// ============================================================================

interface CompletedLevelsListProps {
  levels: CourseMapLevel[];
  onLevelPress: (levelId: string) => void;
  visible: boolean;
  onToggle: () => void;
}

const CompletedLevelsList: React.FC<CompletedLevelsListProps> = React.memo(({
  levels,
  onLevelPress,
  visible,
  onToggle,
}) => {
  if (levels.length === 0) return null;

  // Only show last completed level by default as a small badge
  const lastCompleted = levels[levels.length - 1];

  return (
    <View style={styles.completedSection}>
      <TouchableOpacity
        style={styles.completedBadge}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.completedIcon}>
          <AppText style={styles.completedCheckmark}>✓</AppText>
        </View>
        <AppText style={styles.completedText}>
          Level {lastCompleted.unitOrderIndex}.{lastCompleted.orderIndex}: Completed
        </AppText>
      </TouchableOpacity>

      {visible && levels.length > 1 && (
        <View style={styles.completedExpanded}>
          {levels.slice(0, -1).reverse().map((level) => (
            <TouchableOpacity
              key={level.id}
              style={styles.completedItem}
              onPress={() => onLevelPress(level.id)}
            >
              <AppText style={styles.completedItemText}>
                Level {level.unitOrderIndex}.{level.orderIndex}: {level.unitTitle}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

CompletedLevelsList.displayName = 'CompletedLevelsList';

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

export const LearnScreen: React.FC = () => {
  const router = useRouter();

  // Course store
  const activeCourseId = useCourseStore((s) => s.activeCourseId);
  const setActiveCourse = useCourseStore((s) => s.setActiveCourse);
  const setCurrentLevel = useCourseStore((s) => s.setCurrentLevel);

  // Fetch courses and map data
  const { data: courses } = useCourses();
  const {
    displayLevels,
    isLoading,
    isError,
    refetch,
    courseTitle
  } = useCourseMap(activeCourseId);

  // UI State
  const [showCompletedList, setShowCompletedList] = useState(false);
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-select first course
  useEffect(() => {
    if (!activeCourseId && courses && courses.length > 0) {
      setActiveCourse(parseInt(courses[0].id));
    }
  }, [activeCourseId, courses, setActiveCourse]);

  // Handle navigation back
  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  // Handle menu press
  const handleMenuPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Menu',
      text2: 'Coming soon!',
      position: 'bottom',
    });
  }, []);

  // Handle course selector button press
  const handleCourseSelectorPress = useCallback(() => {
    setShowCourseSelector(true);
  }, []);

  // Handle course selection from modal
  const handleSelectCourse = useCallback((courseId: string) => {
    const newCourseId = parseInt(courseId);

    // Update active course
    setActiveCourse(newCourseId);

    // Reset current level for new course
    setCurrentLevel(0);

    // Show success toast
    Toast.show({
      type: 'success',
      text1: 'Course Switched',
      text2: 'Continue learning!',
      position: 'bottom',
    });
  }, [setActiveCourse, setCurrentLevel]);

  // Handle start lesson
  const handleStartLesson = useCallback((levelId: string) => {
    const id = parseInt(levelId);
    setCurrentLevel(id);
    router.push(`/(app)/lesson/${levelId}` as any);
  }, [setCurrentLevel, router]);

  // Handle info press
  const handleInfoPress = useCallback((levelId: string) => {
    Toast.show({
      type: 'info',
      text1: 'Level Info',
      text2: 'Guidebook coming soon!',
      position: 'bottom',
    });
  }, []);

  // Toggle completed levels list
  const toggleCompletedList = useCallback(() => {
    setShowCompletedList((prev) => !prev);
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      Toast.show({
        type: 'success',
        text1: 'Progress Synced',
        text2: 'Your latest progress has been loaded',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Could not refresh progress data',
        position: 'bottom',
      });
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <CourseMapHeader title="Course Map" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <AppText style={styles.loadingText}>Loading course...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  // No course selected
  if (!activeCourseId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <CourseMapHeader title="Course Map" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyEmoji}>🌍</AppText>
          <AppText style={styles.emptyTitle}>No Active Course</AppText>
          <AppText style={styles.emptyText}>
            Browse courses and enroll to start learning
          </AppText>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/courses/list')}
          >
            <AppText style={styles.browseButtonText}>Browse Courses</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <CourseMapHeader title="Course Map" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyEmoji}></AppText>
          <AppText style={styles.emptyTitle}>Error</AppText>
          <AppText style={styles.emptyText}>
            Failed to load course data
          </AppText>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <AppText style={styles.retryButtonText}>Try Again</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CourseMapHeader
        title="Course Map"
        onBackPress={handleBackPress}
        onMenuPress={handleMenuPress}
      />

      {/* Course Selector Button */}
      <TouchableOpacity
        style={styles.courseSelectorButton}
        onPress={handleCourseSelectorPress}
        activeOpacity={0.7}
      >
        <AppText style={styles.courseSelectorText} numberOfLines={1}>
          {courseTitle || 'Select Course'}
        </AppText>
        <ChevronDown size={isTablet ? 24 : 20} color={COLORS.primary.main} strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary.main}
            colors={[COLORS.primary.main]}
            title="Pull to sync progress"
            titleColor={COLORS.neutral.body}
          />
        }
      >
        {/* Completed Levels (Collapsed) */}
        <CompletedLevelsList
          levels={displayLevels.completed}
          onLevelPress={handleStartLesson}
          visible={showCompletedList}
          onToggle={toggleCompletedList}
        />

        {/* Active Level Card (Large) */}
        {displayLevels.active && (
          <LevelCard
            level={displayLevels.active}
            variant="active"
            onStartLesson={handleStartLesson}
            onInfoPress={handleInfoPress}
          />
        )}

        {/* Next Level Preview (Blur) */}
        {displayLevels.next && (
          <LevelCard
            level={displayLevels.next}
            variant="next"
            onStartLesson={handleStartLesson}
          />
        )}
      </ScrollView>

      {/* Course Selector Modal */}
      <CourseSelectorModal
        visible={showCourseSelector}
        onClose={() => setShowCourseSelector(false)}
        onSelectCourse={handleSelectCourse}
        currentCourseId={activeCourseId?.toString() || null}
      />
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: SPACING.sm,
  },

  // Course Selector Button
  courseSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.surface,
    marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    paddingHorizontal: isTablet ? SPACING.lg : SPACING.md,
    paddingVertical: isTablet ? SPACING.md : SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  courseSelectorText: {
    fontFamily: FONTS.medium,
    fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary.main,
    flex: 1,
    marginRight: SPACING.sm,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.body,
  },

  // Empty/Error States
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: isTablet ? 80 : 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.heading,
    fontSize: isTablet ? FONT_SIZES.xxl : FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
    color: COLORS.neutral.body,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  browseButton: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // Completed Levels Section
  completedSection: {
    marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
    marginBottom: SPACING.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.surface,
    borderRadius: RADIUS.lg,
    padding: isTablet ? SPACING.md : SPACING.sm + 4,
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
  completedExpanded: {
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  completedItem: {
    backgroundColor: COLORS.neutral.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  completedItemText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.body,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export default LearnScreen;
