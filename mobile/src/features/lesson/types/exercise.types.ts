// src/features/lesson/types/exercise.types.ts
// Exercise type definitions matching backend JSONB structure

// ============================================================================
// BASE TYPES
// ============================================================================

export type ExerciseType = 'multiple_choice' | 'match_pairs' | 'translate' | 'listen' | 'speak';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

export type LessonStatus = 'idle' | 'in_progress' | 'checking' | 'feedback' | 'completed' | 'failed';

// ============================================================================
// EXERCISE CONTENT (Union Type for different exercise types)
// ============================================================================

export interface MultipleChoiceContent {
  prompt: string;
  options: string[];
  correct_answer: string;
  hint?: string;
  audio_url?: string;
}

export interface MatchPairsContent {
  pairs: Array<{
    left: string;
    right: string;
  }>;
}

export interface TranslateContent {
  prompt: string;
  correct_answers: string[]; // Multiple acceptable answers
  hint?: string;
  audio_url?: string;
}

export interface ListenContent {
  audio_url: string;
  transcript: string;
  options?: string[]; // For listen + choose variant
}

// Discriminated union for type safety
export type ExerciseContent =
  | { type: 'multiple_choice'; data: MultipleChoiceContent }
  | { type: 'match_pairs'; data: MatchPairsContent }
  | { type: 'translate'; data: TranslateContent }
  | { type: 'listen'; data: ListenContent };

// ============================================================================
// EXERCISE MODEL (from backend)
// ============================================================================

export interface Exercise {
  id: string;
  levelId: string;
  type: ExerciseType;
  difficultyScore: number;
  content: Record<string, unknown>; // Raw JSONB from backend
  mediaMetadata?: Record<string, unknown>;
}

// Parsed exercise ready for rendering
export interface ParsedExercise {
  id: string;
  type: ExerciseType;
  content: ExerciseContent;
  difficulty: number;
}

// ============================================================================
// LESSON SESSION
// ============================================================================

export interface LessonSession {
  levelId: number;
  exercises: ParsedExercise[];
  currentIndex: number;
  hearts: number;
  correctCount: number;
  wrongCount: number;
  startTime: Date;
  status: LessonStatus;
}

// ============================================================================
// LESSON RESULT (for POST /lesson-flow/finish)
// ============================================================================

export interface LessonResult {
  levelId: number;
  courseId: number;
  unitId: number;
  xpEarned: number;
  durationSeconds: number;
  accuracyPercentage: number;
  isPerfect: boolean;
}

// ============================================================================
// USER ANSWER
// ============================================================================

export interface UserAnswer {
  exerciseId: string;
  answer: string | string[]; // string for single, array for match pairs
  isCorrect: boolean;
  timeSpentMs: number;
}
