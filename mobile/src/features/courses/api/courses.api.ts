// src/features/courses/api/courses.api.ts
// API functions for courses module

import { apiClient } from '../../../api/client';
import { CourseHierarchyResponse, CourseBasic, EnrollmentResponse, MyCourse, CourseProgressResponse } from '../types';

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

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: number, userId: string): Promise<EnrollmentResponse> {
    const response = await apiClient.post<EnrollmentResponse>(
      `/courses/${courseId}/enroll`,
      null,
      {
        params: { userId },
      }
    );
    return response.data;
  },

  /**
   * Get user's enrolled courses
   */
  async getMyCourses(): Promise<MyCourse[]> {
    const response = await apiClient.get<MyCourse[]>('/courses/my-courses');
    return response.data;
  },

  /**
   * Get course progress for a specific course
   */
  async getCourseProgress(courseId: number, userId: string): Promise<CourseProgressResponse> {
    const response = await apiClient.get<CourseProgressResponse>(
      `/courses/${courseId}/progress`,
      {
        params: { userId },
      }
    );
    return response.data;
  },
};
