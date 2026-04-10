// src/features/courses/types/progress.types.ts
// User progress types for course map display

export interface LevelProgress {
  levelId: string;
  completedLessons: number;
  totalLessons: number;
  xpEarned: number;
  timeSpentMinutes: number;
  lastCompletedAt: string | null;
}

export interface UnitProgress {
  unitId: string;
  completedLevels: number;
  totalLevels: number;
  progress: number; // 0-100
}

export interface CourseProgress {
  courseId: string;
  enrolledAt: string;
  currentUnitIndex: number;
  currentLevelIndex: number;
  totalXp: number;
  totalTimeMinutes: number;
  levels: Record<string, LevelProgress>;
}

export type LevelStatus = 'locked' | 'active' | 'in_progress' | 'completed';

export interface CourseMapLevel {
  id: string;
  unitId: string;
  unitTitle: string;
  unitOrderIndex: number;
  orderIndex: number;
  totalLessons: number;
  completedLessons: number;
  status: LevelStatus;
  xpEarned: number;
  timeSpentMinutes: number;
  progress: number; // 0-100
}

export interface CourseMapData {
  courseId: string;
  courseTitle: string;
  levels: CourseMapLevel[];
  currentLevelId: string | null;
  completedLevelsCount: number;
  totalLevelsCount: number;
}
