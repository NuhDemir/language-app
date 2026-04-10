import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CourseRepository } from './repositories';
import { CourseHierarchyResponse } from './interfaces';

/**
 * Service for course operations.
 * Uses CourseRepository for complex queries.
 */
@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly courseRepository: CourseRepository) { }

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

  /**
   * Get user's progress for a specific course.
   */
  async getUserCourseProgress(userId: string, courseId: number) {
    const progress = await this.courseRepository.getUserCourseProgress(
      userId,
      courseId,
    );

    if (!progress) {
      throw new NotFoundException({
        type: 'COURSE_NOT_FOUND',
        message: 'Kurs bulunamadı.',
        courseId,
      });
    }

    return progress;
  }

  /**
   * Enroll user in a course.
   */
  async enrollInCourse(userId: string, courseId: number) {
    // Check if course exists
    const course = await this.courseRepository.findOne(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if already enrolled
    const existingEnrollment = await this.courseRepository.getEnrollment(
      userId,
      courseId,
    );

    if (existingEnrollment) {
      throw new ConflictException({
        type: 'ALREADY_ENROLLED',
        message: 'Bu kursa zaten kayıtlısınız.',
        courseId,
      });
    }

    // Create enrollment
    const enrollment = await this.courseRepository.createEnrollment(
      userId,
      courseId,
    );

    this.logger.log(
      `User ${userId} enrolled in course ${courseId}`,
    );

    return {
      message: 'Successfully enrolled',
      courseId: courseId.toString(),
      enrolledAt: enrollment.enrolledAt,
    };
  }
}
