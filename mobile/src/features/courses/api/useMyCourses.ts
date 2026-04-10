// src/features/courses/api/useMyCourses.ts
// Hook for fetching user's enrolled courses with error handling

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from './courses.api';
import { MyCourse } from '../types';
import { parseApiError } from '../types/errors.types';

export const useMyCourses = () => {
    return useQuery<MyCourse[], Error>({
        queryKey: ['my-courses'],
        queryFn: async () => {
            try {
                return await coursesApi.getMyCourses();
            } catch (error) {
                const parsedError = parseApiError(error);
                console.error('❌ [My Courses] Failed to fetch enrolled courses:', {
                    type: parsedError.type,
                    message: parsedError.message,
                    statusCode: parsedError.statusCode,
                });
                throw parsedError;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            const parsedError = parseApiError(error);
            // Only retry network errors and server errors, max 3 times
            return parsedError.retryable && failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};
