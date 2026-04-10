import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { VocabRepository } from './repositories';

/**
 * DTO for updating vocabulary progress.
 */
class UpdateProgressDto {
  wordToken: string;
  stability: number;
  difficulty: number;
  repetitionCount: number;
  nextReviewAt: string; // ISO date string
}

/**
 * Controller for vocabulary and SRS operations.
 * Handles spaced repetition queries and progress updates.
 */
@ApiTags('Vocabulary')
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabRepository: VocabRepository) {}

  /**
   * Get words due for review (SRS queue).
   */
  @Get('due')
  @ApiOperation({
    summary: 'Get words due for review',
    description:
      'Returns words where next_review_at <= NOW(), ordered by urgency. Uses covering index for optimal performance.',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    description: 'User ID (UUID)',
    required: true,
  })
  @ApiQuery({
    name: 'courseId',
    type: 'number',
    description: 'Course ID',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'Maximum number of words (default: 10)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Words due for review',
    schema: {
      example: [
        {
          wordToken: 'merhaba',
          stability: 2.5,
          difficulty: 0.3,
          nextReviewAt: '2025-12-17T14:00:00.000Z',
        },
      ],
    },
  })
  async getDueWords(
    @Query('userId') userId: string,
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.vocabRepository.getDueWords(
      userId,
      BigInt(courseId),
      limit ?? 10,
    );
  }

  /**
   * Get all vocabulary for a user in a course.
   */
  @Get()
  @ApiOperation({
    summary: 'Get user vocabulary',
    description: 'Returns all vocabulary progress for a user in a specific course.',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    description: 'User ID (UUID)',
    required: true,
  })
  @ApiQuery({
    name: 'courseId',
    type: 'number',
    description: 'Course ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User vocabulary list',
  })
  async getUserVocabulary(
    @Query('userId') userId: string,
    @Query('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.vocabRepository.getUserVocabulary(userId, BigInt(courseId));
  }

  /**
   * Update vocabulary progress after review.
   */
  @Post('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update word progress',
    description:
      'Updates SRS parameters (stability, difficulty, nextReviewAt) for a word after review.',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    description: 'User ID (UUID)',
    required: true,
  })
  @ApiQuery({
    name: 'courseId',
    type: 'number',
    description: 'Course ID',
    required: true,
  })
  @ApiBody({
    type: UpdateProgressDto,
    examples: {
      example1: {
        summary: 'Successful review',
        value: {
          wordToken: 'merhaba',
          stability: 5.0,
          difficulty: 0.2,
          repetitionCount: 3,
          nextReviewAt: '2025-12-20T14:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Progress updated',
  })
  async updateProgress(
    @Query('userId') userId: string,
    @Query('courseId', ParseIntPipe) courseId: number,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.vocabRepository.upsertProgress(userId, BigInt(courseId), dto.wordToken, {
      stability: dto.stability,
      difficulty: dto.difficulty,
      repetitionCount: dto.repetitionCount,
      nextReviewAt: new Date(dto.nextReviewAt),
    });
  }
}
