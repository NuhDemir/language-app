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
  phase: string;
}

// FlatList için dönüştürülmüş veri tipi
export type MapItem = 
  | { type: 'unit'; data: UnitWithLevels }
  | { type: 'level'; data: LevelNode; unitId: string };
