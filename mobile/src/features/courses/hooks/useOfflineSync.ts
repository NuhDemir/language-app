// src/features/courses/hooks/useOfflineSync.ts
// Hook to handle offline sync on app resume

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncPendingCompletions, getPendingCompletions } from '../api/offlineProgressSync';

/**
 * Hook to automatically sync pending completions when app becomes active
 * 
 * Usage:
 * - Call this hook in your root App component or main screen
 * - It will automatically sync when app resumes from background
 * - It will also sync on mount if there are pending completions
 * 
 * Preconditions:
 * - User is authenticated
 * 
 * Postconditions:
 * - Pending completions synced when app becomes active
 * - Callback invoked with sync results
 */
export function useOfflineSync(options?: {
    onSyncComplete?: (result: { total: number; synced: number; failed: number }) => void;
    onSyncError?: (error: Error) => void;
    enabled?: boolean;
}) {
    const { onSyncComplete, onSyncError, enabled = true } = options || {};
    const appState = useRef(AppState.currentState);
    const isSyncing = useRef(false);

    const performSync = async () => {
        // Prevent concurrent syncs
        if (isSyncing.current) {
            console.log('⏭️ [Offline Sync Hook] Sync already in progress, skipping');
            return;
        }

        try {
            isSyncing.current = true;

            // Check if there are pending completions
            const pending = await getPendingCompletions();
            if (pending.length === 0) {
                console.log('✅ [Offline Sync Hook] No pending completions');
                return;
            }

            console.log(`🔄 [Offline Sync Hook] Starting sync of ${pending.length} completions`);

            // Sync pending completions
            const result = await syncPendingCompletions();

            console.log('✅ [Offline Sync Hook] Sync complete:', result);

            // Invoke callback
            if (onSyncComplete) {
                onSyncComplete(result);
            }
        } catch (error) {
            console.error('❌ [Offline Sync Hook] Sync failed:', error);
            if (onSyncError && error instanceof Error) {
                onSyncError(error);
            }
        } finally {
            isSyncing.current = false;
        }
    };

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Sync on mount if there are pending completions
        performSync();

        // Listen for app state changes
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // App became active (from background or inactive)
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('📱 [Offline Sync Hook] App became active, triggering sync');
                performSync();
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [enabled]);

    return {
        syncNow: performSync,
    };
}
