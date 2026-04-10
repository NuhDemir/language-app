// src/features/courses/api/offlineProgressSync.ts
// Offline progress sync mechanism using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../api/client';
import { useCourseStore } from '../stores';
import { queryClient } from '../../../providers/QueryProvider';

const PENDING_COMPLETIONS_KEY = '@pending_lesson_completions';

export interface PendingCompletion {
    id: string; // Unique ID for this pending completion
    courseId: number;
    levelId: number;
    unitId: number;
    xpEarned: number;
    durationSeconds: number;
    accuracyPercentage: number;
    isPerfect: boolean;
    timestamp: string; // When it was queued
    retryCount: number; // Number of retry attempts
}

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
 * Queue a lesson completion for later sync when network fails
 * 
 * Preconditions:
 * - Lesson was completed successfully
 * - Network request failed
 * 
 * Postconditions:
 * - Completion data stored in AsyncStorage
 * - Unique ID assigned to completion
 */
export async function queueLessonCompletion(
    courseId: number,
    levelId: number,
    unitId: number,
    xpEarned: number,
    durationSeconds: number,
    accuracyPercentage: number,
    isPerfect: boolean
): Promise<void> {
    try {
        console.log('📥 [Offline Sync] Queuing lesson completion for later sync');

        // Get existing queue
        const queue = await getPendingCompletions();

        // Create new pending completion
        const pendingCompletion: PendingCompletion = {
            id: `${courseId}-${levelId}-${Date.now()}`,
            courseId,
            levelId,
            unitId,
            xpEarned,
            durationSeconds,
            accuracyPercentage,
            isPerfect,
            timestamp: new Date().toISOString(),
            retryCount: 0,
        };

        // Add to queue
        queue.push(pendingCompletion);

        // Save to AsyncStorage
        await AsyncStorage.setItem(PENDING_COMPLETIONS_KEY, JSON.stringify(queue));

        console.log('✅ [Offline Sync] Completion queued successfully:', pendingCompletion.id);
    } catch (error) {
        console.error('❌ [Offline Sync] Failed to queue completion:', error);
        throw error;
    }
}

/**
 * Get all pending completions from AsyncStorage
 * 
 * Postconditions:
 * - Returns array of pending completions
 * - Returns empty array if none exist
 */
export async function getPendingCompletions(): Promise<PendingCompletion[]> {
    try {
        const data = await AsyncStorage.getItem(PENDING_COMPLETIONS_KEY);
        if (!data) {
            return [];
        }
        return JSON.parse(data) as PendingCompletion[];
    } catch (error) {
        console.error('❌ [Offline Sync] Failed to get pending completions:', error);
        return [];
    }
}

/**
 * Remove a completion from the queue
 * 
 * Preconditions:
 * - completionId exists in queue
 * 
 * Postconditions:
 * - Completion removed from AsyncStorage
 */
async function removeCompletionFromQueue(completionId: string): Promise<void> {
    try {
        const queue = await getPendingCompletions();
        const updatedQueue = queue.filter(c => c.id !== completionId);
        await AsyncStorage.setItem(PENDING_COMPLETIONS_KEY, JSON.stringify(updatedQueue));
        console.log('✅ [Offline Sync] Removed completion from queue:', completionId);
    } catch (error) {
        console.error('❌ [Offline Sync] Failed to remove completion from queue:', error);
    }
}

/**
 * Update retry count for a completion
 * 
 * Preconditions:
 * - completionId exists in queue
 * 
 * Postconditions:
 * - Retry count incremented in AsyncStorage
 */
async function incrementRetryCount(completionId: string): Promise<void> {
    try {
        const queue = await getPendingCompletions();
        const updatedQueue = queue.map(c =>
            c.id === completionId
                ? { ...c, retryCount: c.retryCount + 1 }
                : c
        );
        await AsyncStorage.setItem(PENDING_COMPLETIONS_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
        console.error('❌ [Offline Sync] Failed to increment retry count:', error);
    }
}

/**
 * Sync a single pending completion to the backend
 * 
 * Preconditions:
 * - Network is available
 * - User is authenticated
 * 
 * Postconditions:
 * - Completion synced to backend
 * - Local store updated
 * - Completion removed from queue
 * 
 * Returns:
 * - true if sync successful
 * - false if sync failed
 */
async function syncSingleCompletion(completion: PendingCompletion): Promise<boolean> {
    try {
        console.log('🔄 [Offline Sync] Syncing completion:', completion.id);

        const request: LessonFinishRequest = {
            levelId: completion.levelId,
            courseId: completion.courseId,
            unitId: completion.unitId,
            xpEarned: completion.xpEarned,
            durationSeconds: completion.durationSeconds,
            accuracyPercentage: completion.accuracyPercentage,
            isPerfect: completion.isPerfect,
        };

        const response = await apiClient.post<LessonFinishResponse>(
            '/lesson-flow/finish',
            request
        );

        console.log('✅ [Offline Sync] Completion synced successfully:', completion.id);

        // Update local store
        const { markLevelCompleted } = useCourseStore.getState();
        markLevelCompleted(completion.levelId);

        // Invalidate queries
        await queryClient.invalidateQueries({
            queryKey: ['course', completion.courseId, 'progress']
        });

        await queryClient.invalidateQueries({
            queryKey: ['course', completion.courseId, 'hierarchy']
        });

        await queryClient.invalidateQueries({
            queryKey: ['my-courses']
        });

        // Remove from queue
        await removeCompletionFromQueue(completion.id);

        return true;
    } catch (error: any) {
        console.error('❌ [Offline Sync] Failed to sync completion:', completion.id, error);

        // Increment retry count
        await incrementRetryCount(completion.id);

        // If too many retries (e.g., 5), remove from queue to prevent infinite retries
        if (completion.retryCount >= 5) {
            console.warn('⚠️ [Offline Sync] Max retries reached, removing completion:', completion.id);
            await removeCompletionFromQueue(completion.id);
        }

        return false;
    }
}

/**
 * Sync all pending completions to the backend
 * 
 * Preconditions:
 * - Network is available
 * - User is authenticated
 * 
 * Postconditions:
 * - All pending completions attempted to sync
 * - Successful completions removed from queue
 * - Failed completions remain in queue with incremented retry count
 * 
 * Returns:
 * - Object with success and failure counts
 */
export async function syncPendingCompletions(): Promise<{
    total: number;
    synced: number;
    failed: number;
}> {
    try {
        console.log('🔄 [Offline Sync] Starting sync of pending completions');

        const queue = await getPendingCompletions();

        if (queue.length === 0) {
            console.log('✅ [Offline Sync] No pending completions to sync');
            return { total: 0, synced: 0, failed: 0 };
        }

        console.log(`📊 [Offline Sync] Found ${queue.length} pending completions`);

        let synced = 0;
        let failed = 0;

        // Sync each completion sequentially to avoid overwhelming the server
        for (const completion of queue) {
            const success = await syncSingleCompletion(completion);
            if (success) {
                synced++;
            } else {
                failed++;
            }
        }

        console.log(`✅ [Offline Sync] Sync complete: ${synced} synced, ${failed} failed`);

        return {
            total: queue.length,
            synced,
            failed,
        };
    } catch (error) {
        console.error('❌ [Offline Sync] Failed to sync pending completions:', error);
        return { total: 0, synced: 0, failed: 0 };
    }
}

/**
 * Clear all pending completions (use with caution)
 * 
 * Postconditions:
 * - All pending completions removed from AsyncStorage
 */
export async function clearPendingCompletions(): Promise<void> {
    try {
        await AsyncStorage.removeItem(PENDING_COMPLETIONS_KEY);
        console.log('✅ [Offline Sync] Cleared all pending completions');
    } catch (error) {
        console.error('❌ [Offline Sync] Failed to clear pending completions:', error);
    }
}
