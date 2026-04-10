// src/features/lesson/api/useLessonFinish.ts
// Optimistic lesson completion hook

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from './lesson.api';
import { LessonResult } from '../types';
import { useCourseStore } from '../../courses';

/**
 * Hook for submitting lesson completion
 * Uses optimistic updates - UI shows success immediately,
 * request is sent in background
 */
export const useLessonFinish = () => {
  const queryClient = useQueryClient();
  const markLevelCompleted = useCourseStore((s) => s.markLevelCompleted);

  return useMutation({
    mutationFn: (result: LessonResult) => lessonApi.finishLesson(result),
    
    // Optimistic update
    onMutate: async (result) => {
      console.log('🎯 [Lesson] Optimistically marking level complete:', result.levelId);
      
      // Mark level as completed in local store immediately
      markLevelCompleted(result.levelId);
      
      // Invalidate hierarchy cache so map updates
      await queryClient.invalidateQueries({
        queryKey: ['course', result.courseId, 'hierarchy'],
      });
    },
    
    onSuccess: (response, variables) => {
      console.log('✅ [Lesson] Backend confirmed completion:', response);
      
      // Could update user XP, streak, etc. here
    },
    
    onError: (error, variables) => {
      console.error('❌ [Lesson] Failed to sync completion:', error);
      
      // TODO: Store in offline queue for retry
      // For now, the optimistic update remains
      // User sees success but may need to re-sync later
    },
  });
};
