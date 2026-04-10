// src/features/courses/api/useEnrollCourse.ts
// Hook for enrolling in a course with comprehensive error handling

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { coursesApi } from './courses.api';
import { useCourseStore } from '../stores';
import { EnrollmentResponse } from '../types';
import { parseApiError, CourseErrorType } from '../types/errors.types';
import { useAuthStore } from '../../../stores/auth.store';

export const useEnrollCourse = () => {
    const queryClient = useQueryClient();
    const { addEnrolledCourse, setActiveCourse, enrolledCourseIds } = useCourseStore();
    const userId = useAuthStore((state) => state.user?.id);

    return useMutation({
        mutationFn: async (courseId: number) => {
            if (!userId) {
                throw new Error('User ID is required');
            }
            try {
                return await coursesApi.enrollInCourse(courseId, userId);
            } catch (error) {
                const parsedError = parseApiError(error);
                console.error('❌ [Enrollment] Failed to enroll:', {
                    type: parsedError.type,
                    message: parsedError.message,
                    statusCode: parsedError.statusCode,
                });
                throw parsedError;
            }
        },
        onSuccess: (data: EnrollmentResponse, courseId: number) => {
            console.log('✅ [Enrollment] Successfully enrolled in course:', courseId);

            // Add to enrolled courses
            addEnrolledCourse(courseId);

            // If this is the first enrollment, set as active
            if (enrolledCourseIds.length === 0) {
                console.log('📚 [Enrollment] Setting as active course (first enrollment)');
                setActiveCourse(courseId);
            }

            // Invalidate queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['my-courses'] });

            // Show success toast
            Toast.show({
                type: 'success',
                text1: 'Kayıt Başarılı!',
                text2: 'Kursa başarıyla kaydoldunuz.',
            });
        },
        onError: (error: any) => {
            const parsedError = parseApiError(error);

            // Handle specific error types with user-friendly messages
            switch (parsedError.type) {
                case CourseErrorType.ALREADY_ENROLLED:
                    Toast.show({
                        type: 'info',
                        text1: 'Zaten Kayıtlısınız',
                        text2: 'Bu kursa zaten kayıtlısınız.',
                    });
                    break;

                case CourseErrorType.COURSE_NOT_FOUND:
                    Toast.show({
                        type: 'error',
                        text1: 'Kurs Bulunamadı',
                        text2: 'Bu kurs mevcut değil.',
                    });
                    break;

                case CourseErrorType.NETWORK_ERROR:
                    Toast.show({
                        type: 'error',
                        text1: 'Bağlantı Hatası',
                        text2: 'İnternet bağlantınızı kontrol edin.',
                    });
                    break;

                case CourseErrorType.UNAUTHORIZED:
                    Toast.show({
                        type: 'error',
                        text1: 'Oturum Süresi Doldu',
                        text2: 'Lütfen tekrar giriş yapın.',
                    });
                    break;

                default:
                    Toast.show({
                        type: 'error',
                        text1: 'Kayıt Başarısız',
                        text2: parsedError.message,
                    });
            }
        },
        retry: (failureCount, error: any) => {
            const parsedError = parseApiError(error);
            // Only retry network errors and server errors, max 2 times
            return parsedError.retryable && failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    });
};
