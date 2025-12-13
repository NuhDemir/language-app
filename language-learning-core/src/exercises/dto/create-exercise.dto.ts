import { IsString, IsInt, Min, Max, IsOptional, IsObject } from 'class-validator';

/**
 * DTO for creating a new exercise.
 * Content validation is handled by Zod schemas at the service layer.
 */
export class CreateExerciseDto {
  /** Level ID this exercise belongs to */
  @IsInt()
  levelId: number;

  /** Exercise type: 'translate', 'match_pairs', 'listen_tap', 'speak' */
  @IsString()
  type: string;

  /** Difficulty score (1-10) */
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  difficultyScore?: number = 1;

  /**
   * Content payload (validated by Zod at service layer).
   * Structure depends on `type` field.
   */
  @IsObject()
  content: Record<string, unknown>;

  /** Optional media metadata */
  @IsObject()
  @IsOptional()
  mediaMetadata?: Record<string, unknown>;
}
