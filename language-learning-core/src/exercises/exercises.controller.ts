import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto';

/**
 * Controller for exercise management.
 * Handles CRUD operations and content queries.
 */
@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  /**
   * Create a new exercise with validated content.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new exercise',
    description:
      'Creates an exercise with type-specific content validation using Zod schemas.',
  })
  @ApiBody({ type: CreateExerciseDto })
  @ApiResponse({
    status: 201,
    description: 'Exercise created successfully',
    schema: {
      example: {
        id: '1',
        levelId: '1',
        type: 'translate',
        difficultyScore: 1,
        content: { prompt: 'Merhaba', correct_answers: ['Hello'] },
        mediaMetadata: {},
        createdAt: '2025-12-17T14:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid content for exercise type',
  })
  async create(@Body() createExerciseDto: CreateExerciseDto) {
    const result = await this.exercisesService.create(createExerciseDto);
    // Convert BigInt to string for JSON serialization
    return {
      ...result,
      id: result.id.toString(),
      levelId: result.levelId.toString(),
    };
  }

  /**
   * Get all exercises for a specific level.
   */
  @Get('level/:levelId')
  @ApiOperation({
    summary: 'Get exercises by level',
    description: 'Returns all exercises belonging to a specific level.',
  })
  @ApiParam({
    name: 'levelId',
    type: 'number',
    description: 'Level ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of exercises',
  })
  async findByLevel(@Param('levelId', ParseIntPipe) levelId: number) {
    const exercises = await this.exercisesService.findByLevel(levelId);
    return exercises.map((e) => ({
      ...e,
      id: e.id.toString(),
      levelId: e.levelId.toString(),
    }));
  }

  /**
   * Get exercises by type.
   */
  @Get('type/:type')
  @ApiOperation({
    summary: 'Get exercises by type',
    description:
      'Returns all exercises of a specific type (translate, match_pairs, listen_tap, speak).',
  })
  @ApiParam({
    name: 'type',
    type: 'string',
    description: 'Exercise type',
    example: 'translate',
  })
  @ApiResponse({
    status: 200,
    description: 'List of exercises',
  })
  async findByType(@Param('type') type: string) {
    const exercises = await this.exercisesService.findByType(type);
    return exercises.map((e) => ({
      ...e,
      id: e.id.toString(),
      levelId: e.levelId.toString(),
    }));
  }

  /**
   * Get a single exercise by ID.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get exercise by ID',
    description: 'Returns a single exercise by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Exercise ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Exercise found',
  })
  @ApiResponse({
    status: 404,
    description: 'Exercise not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const exercise = await this.exercisesService.findOne(id);
    if (!exercise) {
      return null;
    }
    return {
      ...exercise,
      id: exercise.id.toString(),
      levelId: exercise.levelId.toString(),
    };
  }

  /**
   * Search exercises by content pattern (JSONB containment).
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search exercises by content',
    description:
      'Uses JSONB containment query (@>) to find exercises matching the content pattern. Leverages GIN index for performance.',
  })
  @ApiBody({
    schema: {
      example: { tokens: ['apple'] },
      description: 'JSON pattern to match against exercise content',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Matching exercises',
  })
  async searchByContent(@Body() contentPattern: Record<string, unknown>) {
    return this.exercisesService.findByContent(contentPattern);
  }
}
