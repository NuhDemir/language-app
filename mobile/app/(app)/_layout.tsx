/**
 * App Layout
 * Main layout for authenticated users with bottom tab bar
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import { BottomTabBar } from '../../src/components/ui';
import { Theme } from '../../src/styles';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleCenterPress = () => {
    // Navigate to lesson or practice screen
    router.push('/(app)/lesson/1' as any);
  };

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="lesson/[levelId]" />
      </Stack>

      {/* Bottom Tab Bar - visible on all screens except lesson */}
      <BottomTabBar
        onCenterPress={handleCenterPress}
        hideOnRoutes={['/lesson/']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.app,
  },
});
