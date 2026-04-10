// src/features/lesson/stores/lesson.store.ts
// Zustand store for lesson session state management
// 
// WHY CLIENT STATE instead of React Query cache?
// - Session state is ephemeral (not persisted across app restarts)
// - Needs immediate updates without network round-trips
// - Hearts, currentIndex change frequently during lesson
// - React Query is for SERVER state, this is CLIENT state

import { create } from 'zustand';
import { 
  ParsedExercise, 
  LessonStatus, 
  UserAnswer, 
  LessonResult 
} from '../types';
import { 
  evaluateAnswer, 
  calculateXP, 
  calculateAccuracy 
} from '../utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_HEARTS = 3;
const MAX_HEARTS = 5;

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface LessonState {
  // Session data
  levelId: number | null;
  courseId: number | null;
  unitId: number | null;
  exercises: ParsedExercise[];
  
  // Progress
  currentIndex: number;
  hearts: number;
  
  // Tracking
  correctCount: number;
  wrongCount: number;
  answers: UserAnswer[];
  
  // Timing
  startTime: number | null;
  questionStartTime: number | null;
  
  // UI State
  status: LessonStatus;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  correctAnswer: string | null;
}

interface LessonActions {
  // Lifecycle
  startLesson: (
    levelId: number,
    courseId: number,
    unitId: number,
    exercises: ParsedExercise[]
  ) => void;
  resetLesson: () => void;
  
  // Interaction
  selectAnswer: (answer: string) => void;
  checkAnswer: () => boolean;
  nextQuestion: () => void;
  
  // Getters
  getCurrentExercise: () => ParsedExercise | null;
  getProgress: () => number;
  isLessonComplete: () => boolean;
  getLessonResult: () => LessonResult | null;
}

type LessonStore = LessonState & LessonActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: LessonState = {
  levelId: null,
  courseId: null,
  unitId: null,
  exercises: [],
  currentIndex: 0,
  hearts: INITIAL_HEARTS,
  correctCount: 0,
  wrongCount: 0,
  answers: [],
  startTime: null,
  questionStartTime: null,
  status: 'idle',
  selectedAnswer: null,
  isAnswerCorrect: null,
  correctAnswer: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useLessonStore = create<LessonStore>((set, get) => ({
  ...initialState,

  // -------------------------------------------------------------------------
  // LIFECYCLE
  // -------------------------------------------------------------------------

  startLesson: (levelId, courseId, unitId, exercises) => {
    console.log(`🎮 [Lesson] Starting lesson for level ${levelId} with ${exercises.length} exercises`);
    
    set({
      levelId,
      courseId,
      unitId,
      exercises,
      currentIndex: 0,
      hearts: INITIAL_HEARTS,
      correctCount: 0,
      wrongCount: 0,
      answers: [],
      startTime: Date.now(),
      questionStartTime: Date.now(),
      status: 'in_progress',
      selectedAnswer: null,
      isAnswerCorrect: null,
      correctAnswer: null,
    });
  },

  resetLesson: () => {
    console.log('🔄 [Lesson] Reset');
    set(initialState);
  },

  // -------------------------------------------------------------------------
  // INTERACTION
  // -------------------------------------------------------------------------

  selectAnswer: (answer) => {
    const { status } = get();
    if (status !== 'in_progress') return;
    
    console.log(`👆 [Lesson] Answer selected: ${answer}`);
    set({ selectedAnswer: answer });
  },

  checkAnswer: () => {
    const { 
      exercises, 
      currentIndex, 
      selectedAnswer, 
      questionStartTime,
      hearts,
    } = get();

    // Validate
    if (!selectedAnswer) {
      console.warn('[Lesson] No answer selected');
      return false;
    }

    const exercise = exercises[currentIndex];
    if (!exercise) {
      console.error('[Lesson] No current exercise');
      return false;
    }

    // Get correct answer based on exercise type
    let correctAnswer: string | string[] = '';
    
    if (exercise.content.type === 'multiple_choice') {
      correctAnswer = exercise.content.data.correct_answer;
    } else if (exercise.content.type === 'translate') {
      correctAnswer = exercise.content.data.correct_answers;
    }

    // Evaluate
    const isCorrect = evaluateAnswer(selectedAnswer, correctAnswer);
    const timeSpent = Date.now() - (questionStartTime || Date.now());

    console.log(`✅ [Lesson] Answer check: ${isCorrect ? 'CORRECT' : 'WRONG'}`);

    // Update state
    const newAnswer: UserAnswer = {
      exerciseId: exercise.id,
      answer: selectedAnswer,
      isCorrect,
      timeSpentMs: timeSpent,
    };

    set((state) => ({
      status: 'feedback',
      isAnswerCorrect: isCorrect,
      correctAnswer: Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer,
      answers: [...state.answers, newAnswer],
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
      hearts: isCorrect ? state.hearts : Math.max(0, state.hearts - 1),
    }));

    // Check for failure (no hearts left)
    const newHearts = isCorrect ? hearts : hearts - 1;
    if (newHearts <= 0) {
      set({ status: 'failed' });
    }

    return isCorrect;
  },

  nextQuestion: () => {
    const { currentIndex, exercises, hearts } = get();
    
    // Check if failed
    if (hearts <= 0) {
      set({ status: 'failed' });
      return;
    }

    // Check if completed
    if (currentIndex >= exercises.length - 1) {
      console.log('🎉 [Lesson] Completed!');
      set({ status: 'completed' });
      return;
    }

    // Move to next
    console.log(`➡️ [Lesson] Next question: ${currentIndex + 1}`);
    set({
      currentIndex: currentIndex + 1,
      questionStartTime: Date.now(),
      status: 'in_progress',
      selectedAnswer: null,
      isAnswerCorrect: null,
      correctAnswer: null,
    });
  },

  // -------------------------------------------------------------------------
  // GETTERS
  // -------------------------------------------------------------------------

  getCurrentExercise: () => {
    const { exercises, currentIndex } = get();
    return exercises[currentIndex] || null;
  },

  getProgress: () => {
    const { currentIndex, exercises } = get();
    if (exercises.length === 0) return 0;
    return ((currentIndex + 1) / exercises.length) * 100;
  },

  isLessonComplete: () => {
    const { status } = get();
    return status === 'completed' || status === 'failed';
  },

  getLessonResult: () => {
    const { 
      levelId, 
      courseId, 
      unitId, 
      correctCount, 
      exercises, 
      startTime,
      status,
    } = get();

    if (!levelId || !courseId || !unitId || status !== 'completed') {
      return null;
    }

    const totalCount = exercises.length;
    const durationMs = Date.now() - (startTime || Date.now());
    const durationSeconds = Math.floor(durationMs / 1000);
    const isPerfect = correctCount === totalCount;
    const accuracy = calculateAccuracy(correctCount, totalCount);
    const xpEarned = calculateXP(correctCount, totalCount, durationMs, isPerfect);

    return {
      levelId,
      courseId,
      unitId,
      xpEarned,
      durationSeconds,
      accuracyPercentage: accuracy,
      isPerfect,
    };
  },
}));
