import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto';
import { safeValidateExerciseContent, validateMediaMetadata } from './schemas';

/**
 * Service for managing exercises.
 * Handles JSONB content validation via Zod before database operations.
 */
@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new exercise with validated content.
   * Uses Zod discriminated union to validate content based on type.
   */
  async create(dto: CreateExerciseDto) {
    // 1. Validate content against type-specific schema
    const validationResult = safeValidateExerciseContent(dto.type, dto.content);

    if (!validationResult.success) {
      const errors = validationResult.error.format();
      this.logger.warn(
        `Invalid exercise content for type "${dto.type}": ${JSON.stringify(errors)}`,
      );
      throw new BadRequestException({
        message: `Invalid content for exercise type "${dto.type}"`,
        errors: validationResult.error.issues,
      });
    }

    // 2. Validate media metadata (soft-fail: log warning but continue)
    if (dto.mediaMetadata && Object.keys(dto.mediaMetadata).length > 0) {
      const mediaResult = validateMediaMetadata(dto.mediaMetadata);
      if (!mediaResult.success) {
        this.logger.warn(
          `Exercise type "${dto.type}" has invalid media metadata: ${JSON.stringify(mediaResult.error.issues)}`,
        );
        // Soft fail: don't throw, but log for monitoring
      }
    }

    // 3. Content is validated, safe to insert
    this.logger.log(`Creating exercise of type "${dto.type}" for level ${dto.levelId}`);

    return this.prisma.exercise.create({
      data: {
        levelId: BigInt(dto.levelId),
        type: dto.type,
        difficultyScore: dto.difficultyScore ?? 1,
        content: dto.content as object,
        mediaMetadata: (dto.mediaMetadata ?? {}) as object,
      },
    });
  }

  /**
   * Find all exercises for a given level.
   */
  async findByLevel(levelId: number) {
    return this.prisma.exercise.findMany({
      where: { levelId: BigInt(levelId) },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Find exercises by type.
   */
  async findByType(type: string) {
    return this.prisma.exercise.findMany({
      where: { type },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Find a single exercise by ID.
   */
  async findOne(id: number) {
    return this.prisma.exercise.findUnique({
      where: { id: BigInt(id) },
    });
  }

  /**
   * Find exercises by content using JSONB containment query.
   * Leverages GIN index with jsonb_path_ops for performance.
   * 
   * @param contentPattern - JSON pattern to match (e.g., { tokens: ["apple"] })
   * @returns Exercises whose content contains the pattern
   * 
   * @example
   * // Find exercises containing "apple" in tokens array
   * findByContent({ tokens: ["apple"] })
   */
  async findByContent(contentPattern: Record<string, unknown>) {
    const jsonPattern = JSON.stringify(contentPattern);
    this.logger.log(`Searching exercises with content pattern: ${jsonPattern}`);

    // Use raw query to leverage GIN index with @> operator
    return this.prisma.$queryRaw`
      SELECT id, level_id, type, difficulty_score, content, media_metadata, created_at
      FROM exercises
      WHERE content @> ${jsonPattern}::jsonb
      ORDER BY id ASC
    `;
  }
}

