// src/features/lesson/components/LessonSession.tsx
// Main lesson container - orchestrates the entire lesson flow

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { useLessonStore } from '../stores';
import { initializeAudio, cleanupAudio, playTapFeedback } from '../utils';

import { ProgressBar } from './ProgressBar';
import { HeartsDisplay } from './HeartsDisplay';
import { ExerciseRenderer } from './ExerciseRenderer';
import { FeedbackSheet } from './FeedbackSheet';

interface LessonSessionProps {
  onComplete: () => void;
  onExit: () => void;
}

export const LessonSession: React.FC<LessonSessionProps> = ({
  onComplete,
  onExit,
}) => {
  // Store selectors
  const exercises = useLessonStore((s) => s.exercises);
  const currentIndex = useLessonStore((s) => s.currentIndex);
  const hearts = useLessonStore((s) => s.hearts);
  const status = useLessonStore((s) => s.status);
  const selectedAnswer = useLessonStore((s) => s.selectedAnswer);
  const isAnswerCorrect = useLessonStore((s) => s.isAnswerCorrect);
  const correctAnswer = useLessonStore((s) => s.correctAnswer);

  // Store actions
  const getCurrentExercise = useLessonStore((s) => s.getCurrentExercise);
  const getProgress = useLessonStore((s) => s.getProgress);
  const selectAnswer = useLessonStore((s) => s.selectAnswer);
  const checkAnswer = useLessonStore((s) => s.checkAnswer);
  const nextQuestion = useLessonStore((s) => s.nextQuestion);
  const resetLesson = useLessonStore((s) => s.resetLesson);

  // Animation for check button shake
  const shakeX = useRef(new Animated.Value(0)).current;

  // Get current exercise
  const currentExercise = getCurrentExercise();
  const progress = getProgress();
  const isChecking = status === 'feedback';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
    return () => {
      cleanupAudio();
    };
  }, []);

  // Handle completion/failure
  useEffect(() => {
    if (isCompleted) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  // Handle exit button press
  const handleExit = useCallback(() => {
    Alert.alert(
      'Dersten Çık',
      'İlerlemen kaybolacak. Çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: () => {
            resetLesson();
            onExit();
          }
        },
      ]
    );
  }, [resetLesson, onExit]);

  // Handle answer selection
  const handleSelect = useCallback((answer: string) => {
    if (status !== 'in_progress') return;
    selectAnswer(answer);
  }, [status, selectAnswer]);

  // Handle check button press
  const handleCheck = useCallback(() => {
    playTapFeedback();

    // Validate - shake if no answer selected
    if (!selectedAnswer) {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      return;
    }

    checkAnswer();
  }, [selectedAnswer, checkAnswer, shakeX]);

  // Handle continue after feedback
  const handleContinue = useCallback(() => {
    playTapFeedback();
    nextQuestion();
  }, [nextQuestion]);

  // Failed state
  if (isFailed) {
    return (
      <SafeAreaView style={styles.failedContainer}>
        <View style={styles.failedContent}>
          <AppText style={styles.failedEmoji}>💔</AppText>
          <AppText style={styles.failedTitle}>Ders Başarısız</AppText>
          <AppText style={styles.failedText}>
            Canların bitti! Tekrar dene.
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onExit}
          >
            <AppText style={styles.retryButtonText}>Haritaya Dön</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No exercise to show
  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>Yükleniyor...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          {/* Exit Button */}
          <TouchableOpacity
            style={styles.exitButton}
            onPress={handleExit}
          >
            <X size={24} color={COLORS.neutral.body} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
          </View>

          {/* Hearts */}
          <HeartsDisplay hearts={hearts} />
        </View>
      </SafeAreaView>

      {/* Question Area */}
      <View style={styles.questionArea}>
        <ExerciseRenderer
          exercise={currentExercise}
          selectedAnswer={selectedAnswer}
          isChecked={isChecking}
          correctAnswer={correctAnswer}
          onSelect={handleSelect}
        />
      </View>

      {/* Check Button */}
      {!isChecking && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Animated.View
            style={[
              styles.checkButtonContainer,
              { transform: [{ translateX: shakeX }] }
            ]}
          >
            <View style={[
              styles.checkButtonShadow,
              !selectedAnswer && styles.checkButtonShadowDisabled,
            ]} />
            <TouchableOpacity
              style={[
                styles.checkButton,
                !selectedAnswer && styles.checkButtonDisabled,
              ]}
              onPress={handleCheck}
              activeOpacity={0.8}
            >
              <AppText style={styles.checkButtonText}>KONTROL ET</AppText>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}

      {/* Feedback Sheet */}
      <FeedbackSheet
        visible={isChecking}
        isCorrect={isAnswerCorrect ?? false}
        correctAnswer={correctAnswer ?? undefined}
        onContinue={handleContinue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.bg,
  },
  header: {
    backgroundColor: COLORS.neutral.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  exitButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  questionArea: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.neutral.bg,
  },
  checkButtonContainer: {
    position: 'relative',
  },
  checkButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: COLORS.primary.shadow,
    borderRadius: RADIUS.lg,
  },
  checkButtonShadowDisabled: {
    backgroundColor: COLORS.neutral.lockedShadow,
  },
  checkButton: {
    height: 56,
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: COLORS.neutral.locked,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.neutral.body,
  },
  failedContainer: {
    flex: 1,
    backgroundColor: COLORS.error.bg,
  },
  failedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  failedEmoji: {
    fontSize: 72,
    marginBottom: SPACING.lg,
  },
  failedTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.error.text,
    marginBottom: SPACING.sm,
  },
  failedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.error.main,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
