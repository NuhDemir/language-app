// src/features/courses/stores/course.store.ts
// Zustand store for course state management

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CourseState {
  activeCourseId: number | null;
  currentLevelId: number | null;
  completedLevelIds: number[];
  enrolledCourseIds: number[];
}

interface CourseActions {
  setActiveCourse: (id: number) => void;
  setCurrentLevel: (id: number) => void;
  markLevelCompleted: (id: number) => void;
  resetProgress: () => void;
  addEnrolledCourse: (id: number) => void;
  removeEnrolledCourse: (id: number) => void;
}

type CourseStore = CourseState & CourseActions;

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      // State
      activeCourseId: null,
      currentLevelId: null,
      completedLevelIds: [],
      enrolledCourseIds: [],

      // Actions
      setActiveCourse: (id: number) => {
        console.log('📚 [Course] Active course set:', id);
        set({ activeCourseId: id });
      },

      setCurrentLevel: (id: number) => {
        console.log('📍 [Course] Current level set:', id);
        set({ currentLevelId: id });
      },

      markLevelCompleted: (id: number) => {
        const { completedLevelIds } = get();
        if (!completedLevelIds.includes(id)) {
          console.log('✅ [Course] Level completed:', id);
          set({ completedLevelIds: [...completedLevelIds, id] });
        }
      },

      addEnrolledCourse: (id: number) => {
        const { enrolledCourseIds } = get();
        if (!enrolledCourseIds.includes(id)) {
          console.log('➕ [Course] Course enrolled:', id);
          set({ enrolledCourseIds: [...enrolledCourseIds, id] });
        }
      },

      removeEnrolledCourse: (id: number) => {
        const { enrolledCourseIds, activeCourseId } = get();
        console.log('➖ [Course] Course unenrolled:', id);
        set({
          enrolledCourseIds: enrolledCourseIds.filter(courseId => courseId !== id),
          // If removing active course, clear it
          activeCourseId: activeCourseId === id ? null : activeCourseId,
        });
      },

      resetProgress: () => {
        console.log('🔄 [Course] Progress reset');
        set({
          activeCourseId: null,
          currentLevelId: null,
          completedLevelIds: [],
          enrolledCourseIds: [],
        });
      },
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
