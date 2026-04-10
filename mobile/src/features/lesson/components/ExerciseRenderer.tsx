// src/features/lesson/components/ExerciseRenderer.tsx
// Factory pattern for rendering different exercise types

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppText } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { ParsedExercise } from '../types';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';

interface ExerciseRendererProps {
  exercise: ParsedExercise;
  selectedAnswer: string | null;
  isChecked: boolean;
  correctAnswer: string | null;
  onSelect: (answer: string) => void;
}

/**
 * Factory pattern for exercise rendering
 * Maps exercise type to the appropriate component
 * 
 * Architecture note: Using switch-case for explicit type handling.
 * Could use a Map<ExerciseType, Component> for more dynamic behavior,
 * but switch provides better TypeScript inference and compile-time checks.
 */
export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  selectedAnswer,
  isChecked,
  correctAnswer,
  onSelect,
}) => {
  // Factory switch based on exercise type
  switch (exercise.content.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          content={exercise.content.data}
          selectedAnswer={selectedAnswer}
          isChecked={isChecked}
          correctAnswer={correctAnswer}
          onSelect={onSelect}
        />
      );

    case 'translate':
      // TODO: Implement TranslateQuestion component in future phase
      return (
        <View style={styles.placeholder}>
          <AppText style={styles.placeholderText}>
            📝 Çeviri sorusu (Yakında!)
          </AppText>
          <AppText style={styles.promptText}>
            {exercise.content.data.prompt}
          </AppText>
        </View>
      );

    case 'match_pairs':
      // TODO: Implement MatchPairsQuestion component in future phase
      return (
        <View style={styles.placeholder}>
          <AppText style={styles.placeholderText}>
            Eşleştirme sorusu (Yakında!)
          </AppText>
        </View>
      );

    case 'listen':
      // TODO: Implement ListenQuestion component in future phase
      return (
        <View style={styles.placeholder}>
          <AppText style={styles.placeholderText}>
            Dinleme sorusu (Yakında!)
          </AppText>
        </View>
      );

    default:
      // Exhaustive check - TypeScript will error if a case is missing
      console.error(`[ExerciseRenderer] Unknown exercise type`);
      return (
        <View style={styles.placeholder}>
          <AppText style={styles.placeholderText}>
            Bilinmeyen soru tipi
          </AppText>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  placeholderText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.neutral.body,
    marginBottom: SPACING.md,
  },
  promptText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.neutral.title,
    fontWeight: '600',
    textAlign: 'center',
  },
});
