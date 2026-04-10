// src/features/courses/api/syncProgressAfterLesson.ts
// Function to sync lesson progress after completion with comprehensive error handling

import { apiClient } from '../../../api/client';
import { useCourseStore } from '../stores';
import { queryClient } from '../../../providers/QueryProvider';
import { LessonResult } from '../../lesson/types';
import { queueLessonCompletion } from './offlineProgressSync';
import { parseApiError, CourseErrorType } from '../types/errors.types';
import Toast from 'react-native-toast-message';

interface LessonFinishRequest {
    levelId: number;
    courseId: number;
    unitId: number;
    xpEarned: number;
    durationSeconds: number;
    accuracyPercentage: number;
    isPerfect: boolean;
}

interface LessonFinishResponse {
    success: boolean;
    totalXp: number;
    streakDays: number;
    levelUp: boolean;
}

/**
 * Syncs lesson progress after completion
 * 
 * @param courseId - The course ID
 * @param levelId - The level ID that was completed
 * @param lessonResult - The lesson result data
 * 
 * Preconditions:
 * - Lesson was completed successfully
 * - lessonResult contains valid data (xpEarned, accuracy, duration)
 * - User is authenticated
 * 
 * Postconditions:
 * - Backend lesson_completions table updated (or queued if offline)
 * - users.total_xp incremented (or queued if offline)
 * - Local store updated with new completion
 * - Progress queries invalidated
 * - If network fails, completion data stored in AsyncStorage for retry
 */
export async function syncProgressAfterLesson(
    courseId: number,
    levelId: number,
    lessonResult: LessonResult
): Promise<void> {
    try {
        console.log('🔄 [Progress Sync] Starting sync for level:', levelId);

        // 1. Call backend /lesson-flow/finish endpoint
        const request: LessonFinishRequest = {
            levelId: lessonResult.levelId,
            courseId: lessonResult.courseId,
            unitId: lessonResult.unitId,
            xpEarned: lessonResult.xpEarned,
            durationSeconds: lessonResult.durationSeconds,
            accuracyPercentage: lessonResult.accuracyPercentage,
            isPerfect: lessonResult.isPerfect,
        };

        const response = await apiClient.post<LessonFinishResponse>(
            '/lesson-flow/finish',
            request
        );

        console.log('✅ [Progress Sync] Backend updated successfully:', response.data);

        // 2. Update local Course Store with new completion
        const { markLevelCompleted } = useCourseStore.getState();
        markLevelCompleted(levelId);

        console.log('✅ [Progress Sync] Local store updated');

        // 3. Invalidate React Query progress queries to trigger refetch
        await queryClient.invalidateQueries({
            queryKey: ['course', courseId, 'progress']
        });

        await queryClient.invalidateQueries({
            queryKey: ['course', courseId, 'hierarchy']
        });

        await queryClient.invalidateQueries({
            queryKey: ['my-courses']
        });

        console.log('✅ [Progress Sync] Queries invalidated, refetch triggered');

    } catch (error: any) {
        const parsedError = parseApiError(error);
        console.error('❌ [Progress Sync] Failed to sync progress:', {
            type: parsedError.type,
            message: parsedError.message,
            statusCode: parsedError.statusCode,
        });

        // Handle network errors - queue for offline sync
        if (parsedError.type === CourseErrorType.NETWORK_ERROR) {
            console.log('📥 [Progress Sync] Network error detected, queuing for offline sync');

            try {
                await queueLessonCompletion(
                    lessonResult.courseId,
                    lessonResult.levelId,
                    lessonResult.unitId,
                    lessonResult.xpEarned,
                    lessonResult.durationSeconds,
                    lessonResult.accuracyPercentage,
                    lessonResult.isPerfect
                );

                // Still update local store even when offline
                const { markLevelCompleted } = useCourseStore.getState();
                markLevelCompleted(levelId);

                console.log('✅ [Progress Sync] Completion queued for later sync');

                // Show warning toast
                Toast.show({
                    type: 'warning',
                    text1: 'İlerleme Kaydedilmedi',
                    text2: 'Bağlantı kurulduğunda tekrar denenecek.',
                });

                // Don't throw error - completion was queued successfully
                return;
            } catch (queueError) {
                console.error('❌ [Progress Sync] Failed to queue completion:', queueError);
                Toast.show({
                    type: 'error',
                    text1: 'İlerleme Kaydedilemedi',
                    text2: 'Lütfen tekrar deneyin.',
                });
            }
        }

        // Handle unauthorized errors
        if (parsedError.type === CourseErrorType.UNAUTHORIZED) {
            Toast.show({
                type: 'error',
                text1: 'Oturum Süresi Doldu',
                text2: 'Lütfen tekrar giriş yapın.',
            });
        }

        // Handle server errors
        if (parsedError.type === CourseErrorType.SERVER_ERROR) {
            Toast.show({
                type: 'error',
                text1: 'Sunucu Hatası',
                text2: 'İlerlemeniz kaydedilemedi. Lütfen tekrar deneyin.',
            });
        }

        // Re-throw error for caller to handle (non-network errors)
        throw parsedError;
    }
}
