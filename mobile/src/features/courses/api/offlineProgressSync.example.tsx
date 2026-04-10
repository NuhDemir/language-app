// src/features/courses/api/offlineProgressSync.example.tsx
// Example usage of offline progress sync

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { getPendingCompletions } from './offlineProgressSync';
import Toast from 'react-native-toast-message';

/**
 * Example 1: Basic usage in App root
 * 
 * This is the recommended approach - add the hook to your root App component
 * or main navigation container. It will automatically sync when the app
 * becomes active from background.
 */
export const AppWithOfflineSync = () => {
    // Enable offline sync with callbacks
    useOfflineSync({
        onSyncComplete: (result) => {
            if (result.synced > 0) {
                Toast.show({
                    type: 'success',
                    text1: 'Progress Synced',
                    text2: `${result.synced} lesson(s) synced successfully`,
                });
            }

            if (result.failed > 0) {
                Toast.show({
                    type: 'warning',
                    text1: 'Partial Sync',
                    text2: `${result.failed} lesson(s) failed to sync`,
                });
            }
        },
        onSyncError: (error) => {
            console.error('Sync error:', error);
            Toast.show({
                type: 'error',
                text1: 'Sync Failed',
                text2: 'Could not sync offline progress',
            });
        },
    });

    return (
        <View style={styles.container}>
            <Text>Your App Content</Text>
        </View>
    );
};

/**
 * Example 2: Manual sync trigger
 * 
 * You can also trigger sync manually, for example when user
 * taps a "Sync Now" button or pulls to refresh.
 */
export const ManualSyncExample = () => {
    const { syncNow } = useOfflineSync({
        enabled: false, // Disable automatic sync
        onSyncComplete: (result) => {
            console.log('Manual sync complete:', result);
        },
    });

    const handleManualSync = async () => {
        Toast.show({
            type: 'info',
            text1: 'Syncing...',
            text2: 'Please wait',
        });

        await syncNow();
    };

    return (
        <View style={styles.container}>
            <Button title="Sync Now" onPress={handleManualSync} />
        </View>
    );
};

/**
 * Example 3: Display pending completions count
 * 
 * Show user how many lessons are waiting to be synced
 */
export const PendingCompletionsIndicator = () => {
    const [pendingCount, setPendingCount] = React.useState(0);

    React.useEffect(() => {
        const checkPending = async () => {
            const pending = await getPendingCompletions();
            setPendingCount(pending.length);
        };

        checkPending();

        // Check every 30 seconds
        const interval = setInterval(checkPending, 30000);

        return () => clearInterval(interval);
    }, []);

    if (pendingCount === 0) {
        return null;
    }

    return (
        <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
                {pendingCount} lesson{pendingCount > 1 ? 's' : ''} waiting to sync
            </Text>
        </View>
    );
};

/**
 * Example 4: Integration in LearnScreen
 * 
 * Show how to integrate offline sync in the main learning screen
 */
export const LearnScreenWithOfflineSync = () => {
    const [pendingCount, setPendingCount] = React.useState(0);

    const { syncNow } = useOfflineSync({
        onSyncComplete: (result) => {
            if (result.synced > 0) {
                Toast.show({
                    type: 'success',
                    text1: '✅ Progress Synced',
                    text2: `${result.synced} lesson(s) synced`,
                });
                checkPending();
            }
        },
    });

    const checkPending = async () => {
        const pending = await getPendingCompletions();
        setPendingCount(pending.length);
    };

    React.useEffect(() => {
        checkPending();
    }, []);

    const handleRefresh = async () => {
        // Sync pending completions on pull-to-refresh
        await syncNow();
    };

    return (
        <View style={styles.container}>
            {pendingCount > 0 && (
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>
                        📡 {pendingCount} lesson{pendingCount > 1 ? 's' : ''} pending sync
                    </Text>
                    <Button title="Sync Now" onPress={handleRefresh} />
                </View>
            )}

            <Text>Course Map Content</Text>
        </View>
    );
};

/**
 * Example 5: Conditional sync based on network status
 * 
 * Only enable sync when network is available
 * Note: Requires @react-native-community/netinfo
 */
import NetInfo from '@react-native-community/netinfo';

export const NetworkAwareSync = () => {
    const [isConnected, setIsConnected] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false);
        });

        return () => unsubscribe();
    }, []);

    useOfflineSync({
        enabled: isConnected, // Only sync when connected
        onSyncComplete: (result) => {
            console.log('Sync complete:', result);
        },
    });

    return (
        <View style={styles.container}>
            <View style={[styles.status, isConnected ? styles.online : styles.offline]}>
                <Text style={styles.statusText}>
                    {isConnected ? '🟢 Online' : '🔴 Offline'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    indicator: {
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    indicatorText: {
        color: '#856404',
        fontSize: 14,
        textAlign: 'center',
    },
    banner: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerText: {
        color: '#1565C0',
        fontSize: 14,
        flex: 1,
    },
    status: {
        padding: 8,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    online: {
        backgroundColor: '#D4EDDA',
    },
    offline: {
        backgroundColor: '#F8D7DA',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
