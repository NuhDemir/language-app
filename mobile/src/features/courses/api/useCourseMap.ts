// src/features/courses/api/useCourseMap.ts
// Course Map hook - transforms hierarchy + progress into displayable card data

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { coursesApi } from './courses.api';
import { useCourseStore } from '../stores';
import { useCourseProgress } from './useCourseProgress';
import { parseApiError } from '../types/errors.types';
import type {
  CourseHierarchyResponse,
  CourseMapLevel,
  CourseMapData,
  LevelStatus,
  CourseProgressResponse,
  LevelProgressResponse
} from '../types';

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

/**
 * Calculate level status based on progress data
 * 
 * Algorithm from design document:
 * 1. If all lessons completed -> 'completed'
 * 2. If current level with progress -> 'in_progress'
 * 3. If current level without progress -> 'active'
 * 4. If previous level not completed -> 'locked'
 * 5. If first level and not completed -> 'active'
 */
const calculateLevelStatus = (
  levelId: string,
  levelProgress: LevelProgressResponse | undefined,
  completedLevelIds: number[],
  currentLevelId: number | null,
  isFirstLevel: boolean
): LevelStatus => {
  const id = parseInt(levelId);

  // Step 1: Check if completed (all lessons done)
  if (levelProgress && levelProgress.completedLessons === levelProgress.totalLessons) {
    return 'completed';
  }

  // Also check store's completed list
  if (completedLevelIds.includes(id)) {
    return 'completed';
  }

  // Step 2: Check if current level
  if (currentLevelId === id) {
    // Check if has progress
    if (levelProgress && levelProgress.completedLessons > 0) {
      return 'in_progress';
    } else {
      return 'active';
    }
  }

  // Step 3: Check if previous level is completed
  const previousLevelId = id - 1;

  if (isFirstLevel) {
    // First level is always active if not completed
    return 'active';
  }

  if (completedLevelIds.includes(previousLevelId)) {
    // Previous completed, this is next available
    return 'active';
  } else {
    // Previous not completed, this is locked
    return 'locked';
  }
};

/**
 * Transform hierarchy and progress data into course map data
 * 
 * Algorithm from design document:
 * 1. Flatten hierarchy into levels array
 * 2. Enrich each level with progress data
 * 3. Calculate status for each level
 * 4. Calculate progress percentage
 * 5. Partition levels for display
 */
const transformToCourseMapDataWithProgress = (
  hierarchy: CourseHierarchyResponse,
  progressResponse: CourseProgressResponse | undefined,
  completedLevelIds: number[],
  currentLevelId: number | null
): CourseMapData => {
  const levels: CourseMapLevel[] = [];

  // Create a map for quick progress lookup
  const progressMap = new Map<string, LevelProgressResponse>();
  if (progressResponse?.levels) {
    progressResponse.levels.forEach((levelProgress) => {
      progressMap.set(levelProgress.levelId, levelProgress);
    });
  }

  // Step 1: Flatten hierarchy
  hierarchy.curriculum.forEach((unit) => {
    unit.levels.forEach((level, levelIndex) => {
      // Get progress for this level
      const levelProgress = progressMap.get(level.id);

      // Determine if this is the first level in the course
      const isFirstLevel = unit.order_index === 0 && levelIndex === 0;

      // Calculate status
      const status = calculateLevelStatus(
        level.id,
        levelProgress,
        completedLevelIds,
        currentLevelId,
        isFirstLevel
      );

      // Get lesson counts
      const totalLessons = level.total_lessons || 24;
      const completedLessons = levelProgress?.completedLessons || 0;

      // Calculate progress percentage
      const progressPercent = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      // Create enriched level object
      levels.push({
        id: level.id,
        unitId: unit.id,
        unitTitle: unit.title,
        unitOrderIndex: unit.order_index,
        orderIndex: level.order_index,
        totalLessons,
        completedLessons,
        status,
        xpEarned: levelProgress?.xpEarned || 0,
        timeSpentMinutes: levelProgress?.timeSpentMinutes || 0,
        progress: progressPercent,
      });
    });
  });

  return {
    courseId: hierarchy.id,
    courseTitle: hierarchy.title,
    levels,
    currentLevelId: progressResponse?.currentLevelId || null,
    completedLevelsCount: progressResponse?.completedLevelsCount || 0,
    totalLevelsCount: levels.length,
  };
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useCourseMap = (courseId: number | null) => {
  const completedLevelIds = useCourseStore((s) => s.completedLevelIds);
  const currentLevelId = useCourseStore((s) => s.currentLevelId);

  // Fetch hierarchy
  const hierarchyQuery = useQuery({
    queryKey: ['course', courseId, 'hierarchy'],
    queryFn: async () => {
      try {
        return await coursesApi.getHierarchy(courseId!);
      } catch (error) {
        const parsedError = parseApiError(error);
        console.error('❌ [Course Map] Failed to fetch hierarchy:', {
          courseId,
          type: parsedError.type,
          message: parsedError.message,
          statusCode: parsedError.statusCode,
        });
        throw parsedError;
      }
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: (failureCount, error: any) => {
      const parsedError = parseApiError(error);
      // Only retry network errors and server errors, max 3 times
      return parsedError.retryable && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Fetch progress data
  const progressQuery = useCourseProgress(courseId);

  // Transform data for Course Map display
  const courseMapData = useMemo<CourseMapData | null>(() => {
    if (!hierarchyQuery.data) return null;

    return transformToCourseMapDataWithProgress(
      hierarchyQuery.data,
      progressQuery.data,
      completedLevelIds,
      currentLevelId
    );
  }, [hierarchyQuery.data, progressQuery.data, completedLevelIds, currentLevelId]);

  // Get displaying levels (completed, active, next)
  const displayLevels = useMemo(() => {
    if (!courseMapData) {
      return { completed: [], active: null, next: null };
    }

    const levels = courseMapData.levels;
    const activeIndex = levels.findIndex(
      (l) => l.status === 'active' || l.status === 'in_progress'
    );

    return {
      // All completed levels before active
      completed: activeIndex > 0 ? levels.slice(0, activeIndex) : [],
      // Current active level
      active: activeIndex >= 0 ? levels[activeIndex] : null,
      // Next level (first locked after active)
      next: activeIndex >= 0 && activeIndex < levels.length - 1
        ? levels[activeIndex + 1]
        : null,
    };
  }, [courseMapData]);

  // Refetch function for both queries
  const refetch = () => {
    hierarchyQuery.refetch();
    progressQuery.refetch();
  };

  return {
    data: courseMapData,
    isLoading: hierarchyQuery.isLoading || progressQuery.isLoading,
    isError: hierarchyQuery.isError || progressQuery.isError,
    error: hierarchyQuery.error || progressQuery.error,
    refetch,
    courseMapData,
    displayLevels,
    courseTitle: courseMapData?.courseTitle || '',
  };
};
