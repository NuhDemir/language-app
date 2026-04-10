// src/features/courses/types/course.types.ts
// Course hierarchy type definitions

export type NodeStatus = 'locked' | 'active' | 'completed';
export type NodePosition = 'left' | 'center' | 'right';

export interface LevelNode {
  id: string;
  order_index: number;
  total_lessons: number;
  status: NodeStatus;
  position: NodePosition;
}

export interface UnitWithLevels {
  id: string;
  title: string;
  order_index: number;
  levels: LevelNode[];
}

export interface CourseHierarchyResponse {
  id: string;
  title: string;
  curriculum: UnitWithLevels[];
}

export interface CourseBasic {
  id: string;
  learningLangCode: string;
  fromLangCode: string;
  title: string;
  description?: string;
  phase: string;
}

// Enrollment response
export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  isActive: boolean;
}

// My courses response
export interface MyCourse extends CourseBasic {
  enrolledAt: string;
  isActive: boolean;
  progress: {
    completedLevels: number;
    totalLevels: number;
    totalXp: number;
    currentUnitIndex: number;
    currentLevelIndex: number;
  };
}

// Course with enrollment status
export interface CourseWithEnrollment extends CourseBasic {
  isEnrolled: boolean;
  enrolledAt?: string;
}

// FlatList için dönüştürülmüş veri tipi
export type MapItem =
  | { type: 'unit'; data: UnitWithLevels }
  | { type: 'level'; data: LevelNode; unitId: string };
