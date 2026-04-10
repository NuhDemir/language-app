/**
 * HomeScreen - Main Dashboard
 * Clean modern design with subtle depth
 */

import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/auth.store';
import { Spacing, Y2KPalette } from '../../../styles';
import { UserHeader, StreakCard } from '../components/molecules';
import { StatsGrid, QuickActionsSection } from '../components/organisms';
import { useHomeData } from '../hooks/useHomeData';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const homeData = useHomeData();

  const handleStartLesson = useCallback(() => {
    router.push('/(app)/learn' as any);
  }, [router]);

  const handleViewLeaderboard = useCallback(() => {
    router.push('/(app)/leaderboard' as any);
  }, [router]);

  const handleViewGoals = useCallback(() => {
    // TODO: Implement goals screen
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <UserHeader
          username={homeData.username}
          onLogout={logout}
        />

        <StreakCard streakDays={homeData.streakDays} />

        <StatsGrid
          totalXp={homeData.totalXp}
          level={homeData.level}
          badges={homeData.badges}
          rank={homeData.rank}
        />

        <QuickActionsSection
          onStartLesson={handleStartLesson}
          onViewLeaderboard={handleViewLeaderboard}
          onViewGoals={handleViewGoals}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.l,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;
