// src/features/lesson/api/lesson.api.ts
// API functions for lesson/exercise operations

import { apiClient } from '../../../api/client';
import { Exercise, LessonResult } from '../types';

interface ExercisesResponse {
  exercises: Exercise[];
}

interface LessonFinishRequest {
  levelId: number;
  courseId: number;
  unitId: number;
  xpEarned: number;
  durationSeconds: number;
  accuracyPercentage: number;
  isPerfect: boolean;
}

interface LessonFinishResponse {
  success: boolean;
  totalXp: number;
  streakDays: number;
  levelUp: boolean;
}

export const lessonApi = {
  /**
   * Get exercises for a level
   */
  async getExercises(levelId: number): Promise<Exercise[]> {
    const response = await apiClient.get<ExercisesResponse>(
      `/exercises/level/${levelId}`
    );
    return response.data.exercises;
  },

  /**
   * Submit lesson completion
   * This is called optimistically - UI shows success immediately,
   * request is sent in background
   */
  async finishLesson(result: LessonResult): Promise<LessonFinishResponse> {
    const request: LessonFinishRequest = {
      levelId: result.levelId,
      courseId: result.courseId,
      unitId: result.unitId,
      xpEarned: result.xpEarned,
      durationSeconds: result.durationSeconds,
      accuracyPercentage: result.accuracyPercentage,
      isPerfect: result.isPerfect,
    };

    const response = await apiClient.post<LessonFinishResponse>(
      '/lesson-flow/finish',
      request
    );
    return response.data;
  },
};
