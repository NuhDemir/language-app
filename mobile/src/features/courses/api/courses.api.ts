// src/features/courses/api/courses.api.ts
// API functions for courses module

import { apiClient } from '../../../api/client';
import { CourseHierarchyResponse, CourseBasic } from '../types';

export const coursesApi = {
  /**
   * Get all available courses
   */
  async getCourses(): Promise<CourseBasic[]> {
    const response = await apiClient.get<CourseBasic[]>('/courses');
    return response.data;
  },

  /**
   * Get single course by ID
   */
  async getCourse(id: number): Promise<CourseBasic> {
    const response = await apiClient.get<CourseBasic>(`/courses/${id}`);
    return response.data;
  },

  /**
   * Get full course hierarchy with units and levels
   */
  async getHierarchy(courseId: number): Promise<CourseHierarchyResponse> {
    const response = await apiClient.get<CourseHierarchyResponse>(
      `/courses/${courseId}/hierarchy`
    );
    return response.data;
  },
};
