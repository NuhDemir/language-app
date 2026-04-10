// src/features/lesson/utils/exercise.utils.ts
// Utility functions for exercise evaluation and parsing

import { 
  Exercise, 
  ParsedExercise, 
  ExerciseContent,
  MultipleChoiceContent,
  TranslateContent,
} from '../types';

// ============================================================================
// ANSWER EVALUATION
// ============================================================================

/**
 * Evaluate if user answer is correct
 * Handles case-insensitivity and trimming
 */
export const evaluateAnswer = (
  userAnswer: string,
  correctAnswer: string | string[]
): boolean => {
  const normalizedUser = normalizeAnswer(userAnswer);

  if (Array.isArray(correctAnswer)) {
    // Multiple acceptable answers (e.g., translate)
    return correctAnswer.some(
      (answer) => normalizeAnswer(answer) === normalizedUser
    );
  }

  return normalizedUser === normalizeAnswer(correctAnswer);
};

/**
 * Normalize answer for comparison
 * - Lowercase
 * - Trim whitespace
 * - Remove extra spaces
 * - Remove punctuation (optional)
 */
export const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/[.,!?;:'"]/g, ''); // Remove punctuation
};

// ============================================================================
// XP CALCULATION
// ============================================================================

const BASE_XP = 10;
const PERFECT_BONUS = 5;
const SPEED_BONUS_THRESHOLD_MS = 30000; // Under 30 seconds per question

/**
 * Calculate XP earned from lesson
 */
export const calculateXP = (
  correctCount: number,
  totalCount: number,
  durationMs: number,
  isPerfect: boolean
): number => {
  let xp = correctCount * BASE_XP;

  // Perfect lesson bonus
  if (isPerfect) {
    xp += PERFECT_BONUS * totalCount;
  }

  // Speed bonus (complete under threshold)
  const avgTimePerQuestion = durationMs / totalCount;
  if (avgTimePerQuestion < SPEED_BONUS_THRESHOLD_MS) {
    xp += Math.floor(xp * 0.1); // 10% bonus
  }

  return xp;
};

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (
  correctCount: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100 * 10) / 10; // One decimal
};

// ============================================================================
// EXERCISE PARSING
// ============================================================================

/**
 * Parse raw exercise from backend to typed ParsedExercise
 * Performs runtime type validation
 */
export const parseExercise = (raw: Exercise): ParsedExercise | null => {
  try {
    const content = parseExerciseContent(raw.type, raw.content);
    
    if (!content) {
      console.warn(`[Exercise] Failed to parse content for exercise ${raw.id}`);
      return null;
    }

    return {
      id: raw.id,
      type: raw.type,
      content,
      difficulty: raw.difficultyScore,
    };
  } catch (error) {
    console.error(`[Exercise] Parse error for ${raw.id}:`, error);
    return null;
  }
};

/**
 * Parse exercise content based on type
 */
const parseExerciseContent = (
  type: string,
  rawContent: Record<string, unknown>
): ExerciseContent | null => {
  switch (type) {
    case 'multiple_choice':
      return parseMultipleChoice(rawContent);
    case 'translate':
      return parseTranslate(rawContent);
    // Add more types as needed
    default:
      console.warn(`[Exercise] Unknown type: ${type}`);
      return null;
  }
};

const parseMultipleChoice = (raw: Record<string, unknown>): ExerciseContent | null => {
  if (
    typeof raw.prompt !== 'string' ||
    !Array.isArray(raw.options) ||
    typeof raw.correct_answer !== 'string'
  ) {
    return null;
  }

  const data: MultipleChoiceContent = {
    prompt: raw.prompt,
    options: raw.options as string[],
    correct_answer: raw.correct_answer,
    hint: typeof raw.hint === 'string' ? raw.hint : undefined,
    audio_url: typeof raw.audio_url === 'string' ? raw.audio_url : undefined,
  };

  return { type: 'multiple_choice', data };
};

const parseTranslate = (raw: Record<string, unknown>): ExerciseContent | null => {
  if (
    typeof raw.prompt !== 'string' ||
    !Array.isArray(raw.correct_answers)
  ) {
    return null;
  }

  const data: TranslateContent = {
    prompt: raw.prompt,
    correct_answers: raw.correct_answers as string[],
    hint: typeof raw.hint === 'string' ? raw.hint : undefined,
    audio_url: typeof raw.audio_url === 'string' ? raw.audio_url : undefined,
  };

  return { type: 'translate', data };
};

// ============================================================================
// SHUFFLE UTILITY
// ============================================================================

/**
 * Fisher-Yates shuffle for randomizing options
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
