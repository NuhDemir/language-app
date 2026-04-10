/**
 * HomeScreen
 * Modern home screen with user stats, quick actions, and daily goals
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Flame,
  Trophy,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Zap
} from 'lucide-react-native';

import { Typography, Button } from '../../../components/ui';
import { useAuthStore, useUser } from '../../../stores/auth.store';
import { Theme, Spacing, Radius, Typography as TypographyStyles } from '../../../styles';

export const HomeScreen: React.FC = () => {
  const user = useUser();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleStartLesson = () => {
    router.push('/(app)/learn' as any);
  };

  const handleViewLeaderboard = () => {
    router.push('/(app)/leaderboard' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Typography style={styles.greeting}>
              Merhaba! 👋
            </Typography>
            <Typography style={styles.username}>
              {user?.username}
            </Typography>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Typography style={styles.logoutText}>Çıkış</Typography>
          </TouchableOpacity>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <Flame size={32} color={Theme.success.light} fill={Theme.success.light} />
            </View>
            <View style={styles.streakInfo}>
              <Typography style={styles.streakValue}>
                {user?.streakDays || 0} Gün
              </Typography>
              <Typography style={styles.streakLabel}>
                Günlük Seri
              </Typography>
            </View>
          </View>
          <Typography style={styles.streakMotivation}>
            Harika gidiyorsun! Devam et! 🎉
          </Typography>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Trophy size={24} color={Theme.primary.main} />
            </View>
            <Typography style={styles.statValue}>
              {user?.totalXp || 0}
            </Typography>
            <Typography style={styles.statLabel}>
              Toplam XP
            </Typography>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Target size={24} color={Theme.success.main} />
            </View>
            <Typography style={styles.statValue}>
              {user?.streakDays || 1}
            </Typography>
            <Typography style={styles.statLabel}>
              Seviye
            </Typography>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Award size={24} color={Theme.status.error} />
            </View>
            <Typography style={styles.statValue}>
              0
            </Typography>
            <Typography style={styles.statLabel}>
              Rozet
            </Typography>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={Theme.secondary.main} />
            </View>
            <Typography style={styles.statValue}>
              0
            </Typography>
            <Typography style={styles.statLabel}>
              Sıralama
            </Typography>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Typography style={styles.sectionTitle}>
            Hızlı Erişim
          </Typography>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleStartLesson}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <BookOpen size={28} color={Theme.primary.main} />
            </View>
            <View style={styles.actionContent}>
              <Typography style={styles.actionTitle}>
                Derse Başla
              </Typography>
              <Typography style={styles.actionDescription}>
                Öğrenmeye devam et
              </Typography>
            </View>
            <Zap size={20} color={Theme.text.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleViewLeaderboard}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Trophy size={28} color={Theme.status.error} />
            </View>
            <View style={styles.actionContent}>
              <Typography style={styles.actionTitle}>
                Liderlik Tablosu
              </Typography>
              <Typography style={styles.actionDescription}>
                Sıralamana göz at
              </Typography>
            </View>
            <Zap size={20} color={Theme.text.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Calendar size={28} color={Theme.success.main} />
            </View>
            <View style={styles.actionContent}>
              <Typography style={styles.actionTitle}>
                Günlük Hedefler
              </Typography>
              <Typography style={styles.actionDescription}>
                Yakında gelecek
              </Typography>
            </View>
            <Zap size={20} color={Theme.text.disabled} />
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.app,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: TypographyStyles.size.bodyLarge,
    fontFamily: TypographyStyles.family.regular,
    color: Theme.text.secondary,
  },
  username: {
    fontSize: TypographyStyles.size.h2,
    fontFamily: TypographyStyles.family.bold,
    color: Theme.text.primary,
    marginTop: Spacing.xs,
  },
  logoutButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: Radius.m,
    backgroundColor: Theme.background.paper,
  },
  logoutText: {
    fontSize: TypographyStyles.size.bodySmall,
    fontFamily: TypographyStyles.family.medium,
    color: Theme.text.secondary,
  },
  streakCard: {
    backgroundColor: Theme.primary.light,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  streakIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.l,
    backgroundColor: Theme.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.l,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: TypographyStyles.size.h1,
    fontFamily: TypographyStyles.family.bold,
    color: Theme.text.primary,
  },
  streakLabel: {
    fontSize: TypographyStyles.size.bodyMedium,
    fontFamily: TypographyStyles.family.regular,
    color: Theme.text.secondary,
    marginTop: Spacing.xs,
  },
  streakMotivation: {
    fontSize: TypographyStyles.size.bodyMedium,
    fontFamily: TypographyStyles.family.medium,
    color: Theme.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.s,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '50%',
    padding: Spacing.s,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.m,
    backgroundColor: Theme.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  statValue: {
    fontSize: TypographyStyles.size.h2,
    fontFamily: TypographyStyles.family.bold,
    color: Theme.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: TypographyStyles.size.bodySmall,
    fontFamily: TypographyStyles.family.regular,
    color: Theme.text.secondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: TypographyStyles.size.h3,
    fontFamily: TypographyStyles.family.bold,
    color: Theme.text.primary,
    marginBottom: Spacing.l,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.background.paper,
    borderRadius: Radius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.l,
    backgroundColor: Theme.background.app,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.l,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: TypographyStyles.size.bodyLarge,
    fontFamily: TypographyStyles.family.semiBold,
    color: Theme.text.primary,
    marginBottom: Spacing.xs,
  },
  actionDescription: {
    fontSize: TypographyStyles.size.bodySmall,
    fontFamily: TypographyStyles.family.regular,
    color: Theme.text.secondary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;
