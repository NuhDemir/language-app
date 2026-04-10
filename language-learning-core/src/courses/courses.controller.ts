import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';

/**
 * Controller for course management.
 * Handles course listing and hierarchy queries.
 */
@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  /**
   * Get all available courses.
   */
  @Get()
  @ApiOperation({
    summary: 'Get all courses',
    description: 'Returns a list of all available courses with basic info.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses',
    schema: {
      example: [
        {
          id: '1',
          learningLangCode: 'en',
          fromLangCode: 'tr',
          title: 'Türkçe Konuşanlar İçin İngilizce',
          phase: 'live',
        },
      ],
    },
  })
  async findAll() {
    const courses = await this.coursesService.findAll();
    return courses.map((c) => ({
      ...c,
      id: c.id.toString(),
    }));
  }

  /**
   * Get a single course with language info.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get course by ID',
    description: 'Returns a single course with its language information.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Course ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Course found',
    schema: {
      example: {
        id: '1',
        learningLangCode: 'en',
        fromLangCode: 'tr',
        title: 'Türkçe Konuşanlar İçin İngilizce',
        learningLang: {
          code: 'en',
          name: 'English',
          flagEmoji: '🇺🇸',
        },
        fromLang: {
          code: 'tr',
          name: 'Turkish',
          flagEmoji: '🇹🇷',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const course = await this.coursesService.findOne(id);
    return {
      ...course,
      id: course.id.toString(),
    };
  }

  /**
   * Get complete course hierarchy with units and levels.
   */
  @Get(':id/hierarchy')
  @ApiOperation({
    summary: 'Get course curriculum hierarchy',
    description:
      'Returns the complete course structure with nested units and levels in a single optimized query.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Course ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Course hierarchy',
    schema: {
      example: {
        id: '1',
        title: 'Türkçe Konuşanlar İçin İngilizce',
        curriculum: [
          {
            id: '1',
            title: 'Greetings',
            order_index: 1,
            levels: [
              { id: '1', order_index: 1, total_lessons: 5 },
              { id: '2', order_index: 2, total_lessons: 5 },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async getCourseHierarchy(@Param('id', ParseIntPipe) id: number) {
    const result = await this.coursesService.getCourseHierarchy(id);

    // Convert BigInt to string for JSON serialization
    return {
      id: result.id?.toString() || id.toString(),
      title: result.title,
      description: result.description,
      curriculum: (result.curriculum || []).map((unit) => ({
        id: unit.id?.toString() || '',
        title: unit.title,
        order_index: unit.order_index,
        color_theme: unit.color_theme,
        levels: (unit.levels || []).map((level) => ({
          id: level.id?.toString() || '',
          order_index: level.order_index,
          total_lessons: level.total_lessons,
        })),
      })),
    };
  }

  /**
   * Get user's progress for a specific course.
   */
  @Get(':id/progress')
  @ApiOperation({
    summary: 'Get user course progress',
    description: 'Returns user progress including completed levels, total XP, and enrollment info.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Course ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User progress',
    schema: {
      example: {
        completedLevels: [
          { levelId: '1', completedAt: '2026-04-10T10:00:00Z' },
          { levelId: '2', completedAt: '2026-04-10T11:00:00Z' },
        ],
        totalXp: 150,
        totalLevels: 10,
        enrolledAt: '2026-04-01T08:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found or user not enrolled',
  })
  async getUserProgress(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.coursesService.getUserCourseProgress(userId, id);
  }

  /**
   * Enroll user in a course
   */
  @Post(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enroll in a course',
    description: 'Enrolls the user in the specified course.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Course ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully enrolled',
    schema: {
      example: {
        message: 'Successfully enrolled',
        courseId: '1',
        enrolledAt: '2026-04-10T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Already enrolled',
  })
  async enrollInCourse(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.coursesService.enrollInCourse(userId, id);
  }
}
