// src/features/courses/api/useCourseProgress.ts
// React Query hook for fetching course progress data with error handling

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { coursesApi } from './courses.api';
import { CourseProgressResponse } from '../types';
import { useCourseStore } from '../stores';
import { parseApiError } from '../types/errors.types';
import { useAuthStore } from '../../../stores/auth.store';

/**
 * Hook to fetch course progress data from the backend
 * 
 * @param courseId - The ID of the course to fetch progress for
 * @returns React Query result with course progress data
 * 
 * Features:
 * - Fetches from GET /courses/:courseId/progress endpoint
 * - Returns CourseProgressResponse type with level progress data
 * - Implements 2-minute cache (staleTime)
 * - Updates course store with progress data on success
 * - Handles enabled state when courseId is null
 * - Comprehensive error handling with retry logic
 */
export const useCourseProgress = (courseId: number | null) => {
    const { setCurrentLevel } = useCourseStore();
    const userId = useAuthStore((state) => state.user?.id);

    const query = useQuery({
        queryKey: ['course', courseId, 'progress', userId],
        queryFn: async () => {
            if (!courseId) {
                throw new Error('Course ID is required');
            }
            if (!userId) {
                throw new Error('User ID is required');
            }
            try {
                return await coursesApi.getCourseProgress(courseId, userId);
            } catch (error) {
                const parsedError = parseApiError(error);
                console.error('❌ [Course Progress] Failed to fetch progress:', {
                    courseId,
                    type: parsedError.type,
                    message: parsedError.message,
                    statusCode: parsedError.statusCode,
                });
                throw parsedError;
            }
        },
        enabled: !!courseId && !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: (failureCount, error: any) => {
            const parsedError = parseApiError(error);
            // Only retry network errors and server errors, max 3 times
            return parsedError.retryable && failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });

    // Update course store when progress data is successfully fetched
    useEffect(() => {
        if (query.data && courseId) {
            // Update current level if it's set in the progress data
            if (query.data.currentLevelId) {
                setCurrentLevel(parseInt(query.data.currentLevelId));
            }

            // Log progress update
            console.log('📊 [Course Progress] Updated:', {
                courseId,
                completedLevels: query.data.completedLevelsCount,
                totalLevels: query.data.totalLevelsCount,
                totalXp: query.data.totalXp,
            });
        }
    }, [query.data, courseId, setCurrentLevel]);

    return query;
};
