// src/features/lesson/components/index.ts
// Export components - Reanimated components only when needed

// Non-Reanimated components (safe for Expo Go)
export * from './HeartsDisplay';
export * from './MultipleChoiceQuestion';
export * from './ExerciseRenderer';

// Reanimated components - may cause issues in Expo Go without dev client
export * from './ChoiceCard';
export * from './ProgressBar';
export * from './FeedbackSheet';
export * from './LessonSession';
