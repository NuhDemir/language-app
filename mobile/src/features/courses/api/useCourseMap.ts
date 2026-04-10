// src/features/courses/api/useCourseMap.ts
// Course Map hook - transforms hierarchy + progress into displayable card data

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { coursesApi } from './courses.api';
import { useCourseStore } from '../stores';
import type { 
  CourseHierarchyResponse,
  CourseMapLevel, 
  CourseMapData,
  LevelStatus 
} from '../types';

// ============================================================================
// MOCK PROGRESS DATA (replace with real API when available)
// ============================================================================

interface MockProgressData {
  completedLessons: number;
  xpEarned: number;
  timeSpentMinutes: number;
}

// Simulated progress - in production this comes from the server
const getMockProgress = (levelId: string, isCompleted: boolean, isActive: boolean): MockProgressData => {
  if (isCompleted) {
    return {
      completedLessons: 5 + Math.floor(Math.random() * 2), // 5-6 lessons
      xpEarned: 200 + Math.floor(Math.random() * 150), // 200-350 XP
      timeSpentMinutes: 45 + Math.floor(Math.random() * 30), // 45-75 min
    };
  }
  
  if (isActive) {
    return {
      completedLessons: 12, // Example: 12 of 24
      xpEarned: 450,
      timeSpentMinutes: 135, // 2h 15m
    };
  }
  
  return {
    completedLessons: 0,
    xpEarned: 0,
    timeSpentMinutes: 0,
  };
};

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

const calculateLevelStatus = (
  levelId: string,
  globalIndex: number,
  completedLevelIds: number[],
  currentLevelId: number | null
): LevelStatus => {
  const id = parseInt(levelId);
  
  if (completedLevelIds.includes(id)) {
    return 'completed';
  }
  
  if (currentLevelId === id) {
    return 'in_progress';
  }
  
  // First uncompleted level is active
  if (globalIndex === 0 && !currentLevelId) {
    return 'active';
  }
  
  // Check if previous level is completed
  const prevLevelCompleted = globalIndex === 0 || completedLevelIds.length >= globalIndex;
  if (prevLevelCompleted && !completedLevelIds.includes(id)) {
    // If no current level set, first uncompleted is active
    if (!currentLevelId) {
      return 'active';
    }
  }
  
  return 'locked';
};

const transformToCourseMapData = (
  hierarchy: CourseHierarchyResponse,
  completedLevelIds: number[],
  currentLevelId: number | null
): CourseMapData => {
  const levels: CourseMapLevel[] = [];
  let globalIndex = 0;
  let currentActiveLevelId: string | null = null;
  
  hierarchy.curriculum.forEach((unit) => {
    unit.levels.forEach((level) => {
      const status = calculateLevelStatus(
        level.id,
        globalIndex,
        completedLevelIds,
        currentLevelId
      );
      
      const isCompleted = status === 'completed';
      const isActive = status === 'active' || status === 'in_progress';
      
      if (isActive && !currentActiveLevelId) {
        currentActiveLevelId = level.id;
      }
      
      const mockProgress = getMockProgress(level.id, isCompleted, isActive);
      const totalLessons = level.total_lessons || 24; // Default to 24 if not set
      
      levels.push({
        id: level.id,
        unitId: unit.id,
        unitTitle: unit.title,
        unitOrderIndex: unit.order_index,
        orderIndex: level.order_index,
        totalLessons,
        completedLessons: isCompleted ? totalLessons : mockProgress.completedLessons,
        status,
        xpEarned: mockProgress.xpEarned,
        timeSpentMinutes: mockProgress.timeSpentMinutes,
        progress: isCompleted 
          ? 100 
          : Math.round((mockProgress.completedLessons / totalLessons) * 100),
      });
      
      globalIndex++;
    });
  });
  
  return {
    courseId: hierarchy.id,
    courseTitle: hierarchy.title,
    levels,
    currentLevelId: currentActiveLevelId,
    completedLevelsCount: levels.filter((l) => l.status === 'completed').length,
    totalLevelsCount: levels.length,
  };
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useCourseMap = (courseId: number | null) => {
  const completedLevelIds = useCourseStore((s) => s.completedLevelIds);
  const currentLevelId = useCourseStore((s) => s.currentLevelId);

  const query = useQuery({
    queryKey: ['course', courseId, 'hierarchy'],
    queryFn: () => coursesApi.getHierarchy(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Transform data for Course Map display
  const courseMapData = useMemo<CourseMapData | null>(() => {
    if (!query.data) return null;
    return transformToCourseMapData(
      query.data,
      completedLevelIds,
      currentLevelId
    );
  }, [query.data, completedLevelIds, currentLevelId]);

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

  return {
    ...query,
    courseMapData,
    displayLevels,
    courseTitle: courseMapData?.courseTitle || '',
  };
};
