// src/features/courses/api/useCourseHierarchy.ts
// React Query hook for course hierarchy with data transformation and error handling

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { coursesApi } from './courses.api';
import { useCourseStore } from '../stores';
import {
  CourseHierarchyResponse,
  LevelNode,
  NodeStatus,
  NodePosition,
  MapItem
} from '../types';
import { parseApiError } from '../types/errors.types';

// Zigzag pattern for node positioning
const POSITION_PATTERN: NodePosition[] = ['center', 'left', 'center', 'right'];

/**
 * Calculate node status based on completion state
 */
const calculateNodeStatus = (
  levelId: string,
  orderIndex: number,
  completedLevelIds: number[],
  currentLevelId: number | null
): NodeStatus => {
  const id = parseInt(levelId);

  if (completedLevelIds.includes(id)) {
    return 'completed';
  }

  if (currentLevelId === id) {
    return 'active';
  }

  // First level is always active if no current level set
  if (orderIndex === 1 && !currentLevelId) {
    return 'active';
  }

  return 'locked';
};

/**
 * Get position based on zigzag pattern
 */
const getNodePosition = (globalIndex: number): NodePosition => {
  return POSITION_PATTERN[globalIndex % POSITION_PATTERN.length];
};

/**
 * Transform hierarchy data for FlatList rendering
 */
const transformHierarchyToMapItems = (
  hierarchy: CourseHierarchyResponse,
  completedLevelIds: number[],
  currentLevelId: number | null
): MapItem[] => {
  const items: MapItem[] = [];
  let globalLevelIndex = 0;

  hierarchy.curriculum.forEach((unit) => {
    // Add unit header
    items.push({ type: 'unit', data: unit });

    // Add levels with calculated status and position
    unit.levels.forEach((level) => {
      const enrichedLevel: LevelNode = {
        ...level,
        status: calculateNodeStatus(
          level.id,
          level.order_index,
          completedLevelIds,
          currentLevelId
        ),
        position: getNodePosition(globalLevelIndex),
      };

      items.push({
        type: 'level',
        data: enrichedLevel,
        unitId: unit.id
      });

      globalLevelIndex++;
    });
  });

  return items;
};

/**
 * Main hook for fetching and transforming course hierarchy with error handling
 */
export const useCourseHierarchy = (courseId: number | null) => {
  const completedLevelIds = useCourseStore((s) => s.completedLevelIds);
  const currentLevelId = useCourseStore((s) => s.currentLevelId);

  const query = useQuery({
    queryKey: ['course', courseId, 'hierarchy'],
    queryFn: async () => {
      try {
        return await coursesApi.getHierarchy(courseId!);
      } catch (error) {
        const parsedError = parseApiError(error);
        console.error('❌ [Course Hierarchy] Failed to fetch hierarchy:', {
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

  // Transform data for FlatList
  const mapItems = useMemo(() => {
    if (!query.data) return [];
    return transformHierarchyToMapItems(
      query.data,
      completedLevelIds,
      currentLevelId
    );
  }, [query.data, completedLevelIds, currentLevelId]);

  return {
    ...query,
    mapItems,
    courseTitle: query.data?.title,
  };
};

/**
 * Hook to invalidate hierarchy cache (call after level completion)
 */
export const useInvalidateHierarchy = () => {
  const queryClient = useQueryClient();
  const activeCourseId = useCourseStore((s) => s.activeCourseId);

  return () => {
    if (activeCourseId) {
      queryClient.invalidateQueries({
        queryKey: ['course', activeCourseId, 'hierarchy'],
      });
    }
  };
};
