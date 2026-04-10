// src/features/courses/api/useCourses.ts
// React Query hooks for courses

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from './courses.api';

/**
 * Hook to fetch all available courses
 */
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a single course
 */
export const useCourse = (id: number) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getCourse(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};
