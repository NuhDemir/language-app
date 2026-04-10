// src/features/courses/api/syncProgressAfterLesson.example.tsx
// Usage example for syncProgressAfterLesson function

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { syncProgressAfterLesson } from './syncProgressAfterLesson';
import { LessonResult } from '../../lesson/types';

/**
 * Example 1: Basic usage in LessonScreen
 * 
 * This shows how to call syncProgressAfterLesson after a lesson is completed
 */
export const LessonScreenExample = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLessonComplete = async (result: LessonResult) => {
        setIsLoading(true);

        try {
            // Sync progress to backend
            await syncProgressAfterLesson(
                result.courseId,
                result.levelId,
                result
            );

            // Show success message
            Toast.show({
                type: 'success',
                text1: 'Progress Saved!',
                text2: `You earned ${result.xpEarned} XP`,
            });

            // Navigate back to course map
            router.back();
        } catch (error) {
            // Handle error gracefully
            Toast.show({
                type: 'error',
                text1: 'Failed to save progress',
                text2: 'Your progress may not be saved',
            });

            // Still allow navigation (user can retry later)
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View>
            <Text>Lesson Screen Example</Text>
            {/* Lesson content here */}
        </View>
    );
};

/**
 * Example 2: With offline support
 * 
 * This shows how to handle offline scenarios by storing failed syncs
 * for later retry
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LessonScreenWithOfflineSupport = () => {
    const router = useRouter();

    const handleLessonComplete = async (result: LessonResult) => {
        try {
            await syncProgressAfterLesson(
                result.courseId,
                result.levelId,
                result
            );

            Toast.show({
                type: 'success',
                text1: 'Progress Saved!',
            });
        } catch (error) {
            // Store for retry when connection is restored
            const pendingKey = `pending_sync_${result.levelId}_${Date.now()}`;
            await AsyncStorage.setItem(pendingKey, JSON.stringify(result));

            Toast.show({
                type: 'warning',
                text1: 'Progress Not Saved',
                text2: 'Will retry when connection is restored',
            });
        }

        router.back();
    };

    return (
        <View>
            <Text>Lesson Screen with Offline Support</Text>
        </View>
    );
};

/**
 * Example 3: With loading state and animation
 * 
 * This shows how to provide visual feedback during sync
 */
export const LessonScreenWithAnimation = () => {
    const router = useRouter();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);

    const handleLessonComplete = async (result: LessonResult) => {
        setIsSyncing(true);

        try {
            await syncProgressAfterLesson(
                result.courseId,
                result.levelId,
                result
            );

            // Show success animation
            setShowSuccessAnimation(true);

            // Wait for animation to complete
            setTimeout(() => {
                router.back();
            }, 2000);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Sync Failed',
                text2: 'Please try again',
            });
            setIsSyncing(false);
        }
    };

    return (
        <View>
            {isSyncing && <Text>Syncing progress...</Text>}
            {showSuccessAnimation && <Text>✅ Success!</Text>}
        </View>
    );
};

/**
 * Example 4: Background sync on app resume
 * 
 * This shows how to retry failed syncs when the app comes back online
 */
import { useEffect } from 'react';
import { AppState } from 'react-native';

export const BackgroundSyncExample = () => {
    useEffect(() => {
        const syncPendingProgress = async () => {
            try {
                // Get all pending sync keys
                const keys = await AsyncStorage.getAllKeys();
                const pendingKeys = keys.filter(k => k.startsWith('pending_sync_'));

                console.log(`🔄 Found ${pendingKeys.length} pending syncs`);

                // Retry each pending sync
                for (const key of pendingKeys) {
                    try {
                        const data = await AsyncStorage.getItem(key);
                        if (!data) continue;

                        const result: LessonResult = JSON.parse(data);

                        await syncProgressAfterLesson(
                            result.courseId,
                            result.levelId,
                            result
                        );

                        // Remove from pending after successful sync
                        await AsyncStorage.removeItem(key);
                        console.log(`✅ Synced pending progress for level ${result.levelId}`);
                    } catch (error) {
                        console.error(`❌ Failed to sync ${key}:`, error);
                        // Keep in storage for next retry
                    }
                }
            } catch (error) {
                console.error('❌ Background sync failed:', error);
            }
        };

        // Sync when app becomes active
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                syncPendingProgress();
            }
        });

        // Initial sync on mount
        syncPendingProgress();

        return () => subscription.remove();
    }, []);

    return null;
};

/**
 * Example 5: With retry logic
 * 
 * This shows how to implement automatic retry with exponential backoff
 */
export const LessonScreenWithRetry = () => {
    const router = useRouter();

    const syncWithRetry = async (
        courseId: number,
        levelId: number,
        result: LessonResult,
        maxRetries = 3
    ) => {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await syncProgressAfterLesson(courseId, levelId, result);
                console.log(`✅ Sync successful on attempt ${attempt}`);
                return; // Success!
            } catch (error) {
                lastError = error;
                console.log(`❌ Sync failed on attempt ${attempt}/${maxRetries}`);

                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All retries failed
        throw lastError;
    };

    const handleLessonComplete = async (result: LessonResult) => {
        try {
            await syncWithRetry(result.courseId, result.levelId, result);

            Toast.show({
                type: 'success',
                text1: 'Progress Saved!',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to save progress',
                text2: 'Please check your connection',
            });
        }

        router.back();
    };

    return (
        <View>
            <Text>Lesson Screen with Retry</Text>
        </View>
    );
};
