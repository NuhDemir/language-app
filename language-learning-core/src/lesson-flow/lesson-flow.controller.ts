import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { LessonFlowService } from './lesson-flow.service';
import { FinishLessonDto } from './dto';

/**
 * Controller for lesson flow operations.
 * Handles lesson completion and progress tracking.
 */
@ApiTags('Lesson Flow')
@Controller('lessons')
export class LessonFlowController {
  constructor(private readonly lessonFlowService: LessonFlowService) {}

  /**
   * Complete a lesson with analytics data.
   * Uses atomic transaction to update completion log and user XP.
   */
  @Post('finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finish a lesson',
    description:
      'Records lesson completion and updates user XP in an atomic transaction. Returns new total XP.',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID (UUID format) - Will be replaced with JWT extraction',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: FinishLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson completed successfully',
    schema: {
      example: {
        newTotalXp: '150',
        lessonLogId: '12345',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 404,
    description: 'User or course not found',
  })
  async finishLesson(
    @Body() finishLessonDto: FinishLessonDto,
    // TODO: Replace with @CurrentUser() decorator after auth implementation
    @Query('userId') userId: string,
  ) {
    return this.lessonFlowService.finishLesson(userId, finishLessonDto);
  }

  /**
   * Get user's recent lesson completions.
   */
  @Get('history')
  @ApiOperation({
    summary: 'Get lesson history',
    description: 'Returns the user\'s recent lesson completions.',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    description: 'User ID (UUID)',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'Maximum number of results (default: 10)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson history',
    schema: {
      example: [
        {
          id: '1',
          courseId: '1',
          unitId: '1',
          levelId: '1',
          xpEarned: 15,
          durationSeconds: 120,
          accuracyPercentage: '95.50',
          completedAt: '2025-12-17T14:00:00.000Z',
        },
      ],
    },
  })
  async getHistory(
    @Query('userId') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const completions = await this.lessonFlowService.getRecentCompletions(
      userId,
      limit ?? 10,
    );
    return completions.map((c) => ({
      ...c,
      id: c.id.toString(),
      courseId: c.courseId.toString(),
      unitId: c.unitId.toString(),
      levelId: c.levelId.toString(),
      accuracyPercentage: c.accuracyPercentage.toString(),
    }));
  }
}
