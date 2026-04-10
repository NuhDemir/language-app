// src/features/lesson/components/FeedbackSheet.tsx
// Bottom sheet feedback for correct/wrong answers

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Check, X } from 'lucide-react-native';

import { COLORS, RADIUS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { playCorrectSound, playWrongSound } from '../utils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 200;

interface FeedbackSheetProps {
  visible: boolean;
  isCorrect: boolean;
  correctAnswer?: string;
  onContinue: () => void;
}

export const FeedbackSheet: React.FC<FeedbackSheetProps> = ({
  visible,
  isCorrect,
  correctAnswer,
  onContinue,
}) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Animate sheet visibility
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 150,
        useNativeDriver: true,
      }).start();

      // Play sound feedback
      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isCorrect, translateY]);

  const backgroundColor = isCorrect ? COLORS.success.bg : COLORS.error.bg;
  const iconColor = isCorrect ? COLORS.success.main : COLORS.error.main;
  const buttonColor = isCorrect ? COLORS.success.main : COLORS.error.main;
  const buttonShadow = isCorrect ? COLORS.success.shadow : COLORS.error.shadow;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor },
        { transform: [{ translateY }] }
      ]}
    >
      {/* Icon */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          {isCorrect ? (
            <Check size={32} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <X size={32} color="#FFFFFF" strokeWidth={3} />
          )}
        </View>
        <AppText style={[styles.title, { color: iconColor }]}>
          {isCorrect ? 'Doğru!' : 'Yanlış!'}
        </AppText>
      </View>

      {/* Correct Answer (if wrong) */}
      {!isCorrect && correctAnswer && (
        <View style={styles.correctAnswerContainer}>
          <AppText style={styles.correctAnswerLabel}>Doğru cevap:</AppText>
          <AppText style={styles.correctAnswerText}>{correctAnswer}</AppText>
        </View>
      )}

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <View style={[styles.buttonShadow, { backgroundColor: buttonShadow }]} />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <AppText style={styles.buttonText}>DEVAM ET</AppText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  correctAnswerContainer: {
    marginBottom: SPACING.md,
  },
  correctAnswerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error.text,
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error.text,
  },
  buttonContainer: {
    position: 'relative',
    marginTop: 'auto',
  },
  buttonShadow: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 52,
    borderRadius: RADIUS.lg,
  },
  button: {
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
