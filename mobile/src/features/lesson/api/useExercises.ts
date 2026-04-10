// src/features/lesson/api/useExercises.ts
// React Query hook for fetching exercises

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { lessonApi } from './lesson.api';
import { parseExercise } from '../utils';
import { ParsedExercise } from '../types';

/**
 * Hook to fetch and parse exercises for a level
 */
export const useExercises = (levelId: number | null) => {
  const query = useQuery({
    queryKey: ['exercises', levelId],
    queryFn: () => lessonApi.getExercises(levelId!),
    enabled: !!levelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Parse exercises with type safety
  const parsedExercises = useMemo((): ParsedExercise[] => {
    if (!query.data) return [];
    
    return query.data
      .map(parseExercise)
      .filter((e): e is ParsedExercise => e !== null);
  }, [query.data]);

  return {
    ...query,
    exercises: parsedExercises,
  };
};
