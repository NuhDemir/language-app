import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseRepository } from './repositories';
import { CourseHierarchyResponse } from './interfaces';

/**
 * Service for course operations.
 * Uses CourseRepository for complex queries.
 */
@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly courseRepository: CourseRepository) {}

  /**
   * Get complete course hierarchy with units and levels.
   * Uses optimized single-query approach with json_build_object.
   */
  async getCourseHierarchy(
    courseId: number,
  ): Promise<CourseHierarchyResponse> {
    const result = await this.courseRepository.getCourseHierarchy(courseId);

    if (!result) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return result;
  }

  /**
   * Get all courses.
   */
  async findAll() {
    return this.courseRepository.findAll();
  }

  /**
   * Get single course with language info.
   */
  async findOne(courseId: number) {
    const course = await this.courseRepository.findOne(courseId);

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return course;
  }
}
