import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseHierarchyResponse } from '../interfaces';

/**
 * Repository for complex course queries.
 * Uses raw SQL with json_build_object to eliminate N+1 problem.
 */
@Injectable()
export class CourseRepository {
  private readonly logger = new Logger(CourseRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get complete course hierarchy in a single query.
   * Uses PostgreSQL jsonb_build_object and jsonb_agg for optimal performance.
   *
   * @param courseId - Course ID to fetch
   * @returns Course with nested units and levels as JSON structure
   */
  async getCourseHierarchy(
    courseId: number,
  ): Promise<CourseHierarchyResponse | null> {
    this.logger.log(`Fetching course hierarchy for course ID: ${courseId}`);

    const result = await this.prisma.$queryRaw<CourseHierarchyResponse[]>`
      SELECT 
        c.id,
        c.title,
        c.description,
        
        -- Aggregate units as JSON array
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', u.id,
                'title', u.title,
                'order_index', u.order_index,
                'color_theme', u.color_theme,
                
                -- Aggregate levels within each unit
                'levels', COALESCE(
                  (
                    SELECT jsonb_agg(
                      jsonb_build_object(
                        'id', l.id,
                        'order_index', l.order_index,
                        'total_lessons', l.total_lessons
                      ) ORDER BY l.order_index ASC
                    )
                    FROM levels l
                    WHERE l.unit_id = u.id
                  ), 
                  '[]'::jsonb
                )
              ) ORDER BY u.order_index ASC
            )
            FROM units u
            WHERE u.course_id = c.id
          ),
          '[]'::jsonb
        ) as curriculum
        
      FROM courses c
      WHERE c.id = ${courseId}
    `;

    // $queryRaw always returns an array, get first element
    return result[0] || null;
  }

  /**
   * Get all courses with their basic info (no hierarchy).
   */
  async findAll() {
    return this.prisma.course.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Get course by ID with language info.
   */
  async findOne(courseId: number) {
    return this.prisma.course.findUnique({
      where: { id: BigInt(courseId) },
      include: {
        learningLang: true,
        fromLang: true,
      },
    });
  }
}
