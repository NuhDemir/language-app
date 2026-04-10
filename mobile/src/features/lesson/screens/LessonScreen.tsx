// src/screens/lesson/LessonScreen.tsx
// Lesson screen wrapper - fetches exercises and renders LessonSession

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { COLORS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import {
  useLessonStore,
  useExercises,
  useLessonFinish,
} from '../../lesson';
import { useCourseStore } from '../../courses';
import { LessonSession } from '../../lesson/components';

export default function LessonScreen() {
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();

  const levelIdNum = levelId ? parseInt(levelId) : null;
  const activeCourseId = useCourseStore((s) => s.activeCourseId);

  // Fetch exercises
  const { exercises, isLoading, isError } = useExercises(levelIdNum);

  // Lesson finish mutation
  const finishMutation = useLessonFinish();

  // Lesson store actions
  const startLesson = useLessonStore((s) => s.startLesson);
  const resetLesson = useLessonStore((s) => s.resetLesson);
  const getLessonResult = useLessonStore((s) => s.getLessonResult);
  const status = useLessonStore((s) => s.status);

  // Start lesson when exercises are loaded
  useEffect(() => {
    if (exercises.length > 0 && levelIdNum && activeCourseId) {
      startLesson(levelIdNum, activeCourseId, 1, exercises); // unitId=1 placeholder
    }
  }, [exercises, levelIdNum, activeCourseId, startLesson]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetLesson();
    };
  }, [resetLesson]);

  // Handle lesson completion
  const handleComplete = () => {
    const result = getLessonResult();

    if (result) {
      // Send to backend (optimistic - UI doesn't wait)
      finishMutation.mutate(result);

      Toast.show({
        type: 'success',
        text1: '🎉 Tebrikler!',
        text2: `${result.xpEarned} XP kazandın!`,
      });
    }

    router.replace('/(app)/home');
  };

  // Handle exit
  const handleExit = () => {
    router.replace('/(app)/home');
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <AppText style={styles.loadingText}>Ders yükleniyor...</AppText>
      </View>
    );
  }

  // Error state
  if (isError || !levelIdNum) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.errorEmoji}>😔</AppText>
        <AppText style={styles.errorTitle}>Bir Hata Oluştu</AppText>
        <AppText style={styles.errorText}>
          Ders içeriği yüklenemedi
        </AppText>
      </View>
    );
  }

  // No exercises
  if (exercises.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.errorEmoji}>📚</AppText>
        <AppText style={styles.errorTitle}>İçerik Yok</AppText>
        <AppText style={styles.errorText}>
          Bu ders için henüz soru eklenmemiş
        </AppText>
      </View>
    );
  }

  return (
    <LessonSession
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral.bg,
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.body,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.body,
    textAlign: 'center',
  },
});
