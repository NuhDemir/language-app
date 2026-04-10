// src/features/courses/api/useCourses.ts
// React Query hooks for courses with error handling

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from './courses.api';
import { parseApiError } from '../types/errors.types';

/**
 * Hook to fetch all available courses with error handling
 */
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        return await coursesApi.getCourses();
      } catch (error) {
        const parsedError = parseApiError(error);
        console.error('❌ [Courses] Failed to fetch courses:', {
          type: parsedError.type,
          message: parsedError.message,
          statusCode: parsedError.statusCode,
        });
        throw parsedError;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      const parsedError = parseApiError(error);
      // Only retry network errors and server errors, max 3 times
      return parsedError.retryable && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Hook to fetch a single course with error handling
 */
export const useCourse = (id: number) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      try {
        return await coursesApi.getCourse(id);
      } catch (error) {
        const parsedError = parseApiError(error);
        console.error('❌ [Course] Failed to fetch course:', {
          id,
          type: parsedError.type,
          message: parsedError.message,
          statusCode: parsedError.statusCode,
        });
        throw parsedError;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      const parsedError = parseApiError(error);
      // Only retry network errors and server errors, max 3 times
      return parsedError.retryable && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
