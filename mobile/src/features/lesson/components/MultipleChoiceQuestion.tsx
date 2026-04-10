// src/features/lesson/components/MultipleChoiceQuestion.tsx
// Multiple choice exercise renderer

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { COLORS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { MultipleChoiceContent, ChoiceState } from '../types';
import { ChoiceCard } from './ChoiceCard';
import { shuffleArray } from '../utils';

interface MultipleChoiceQuestionProps {
  content: MultipleChoiceContent;
  selectedAnswer: string | null;
  isChecked: boolean;
  correctAnswer: string | null;
  onSelect: (answer: string) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  content,
  selectedAnswer,
  isChecked,
  correctAnswer,
  onSelect,
}) => {
  // Memoize shuffled options to prevent re-shuffle on every render
  const shuffledOptions = useMemo(() => {
    return shuffleArray(content.options);
  }, [content.options]);

  // Determine card state based on selection and check status
  const getCardState = useCallback((option: string): ChoiceState => {
    if (!isChecked) {
      return selectedAnswer === option ? 'selected' : 'idle';
    }

    // After check
    if (option === correctAnswer) {
      return 'correct';
    }
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'wrong';
    }
    return 'idle';
  }, [isChecked, selectedAnswer, correctAnswer]);

  return (
    <View style={styles.container}>
      {/* Prompt */}
      <View style={styles.promptContainer}>
        <AppText style={styles.promptText}>{content.prompt}</AppText>
        {content.hint && (
          <AppText style={styles.hintText}>💡 {content.hint}</AppText>
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {shuffledOptions.map((option, index) => (
          <ChoiceCard
            key={`${option}-${index}`}
            text={option}
            state={getCardState(option)}
            disabled={isChecked}
            onPress={() => onSelect(option)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  promptContainer: {
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  promptText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    lineHeight: 32,
  },
  hintText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.body,
    marginTop: SPACING.sm,
  },
  optionsContainer: {
    marginTop: SPACING.md,
  },
});
