import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseRepository } from './repositories';

/**
 * Courses module for course management and hierarchy queries.
 * Uses Repository pattern for optimized database access.
 */
@Module({
  providers: [CoursesService, CourseRepository],
  exports: [CoursesService],
})
export class CoursesModule {}
