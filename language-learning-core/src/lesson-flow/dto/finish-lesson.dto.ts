import { IsInt, IsNumber, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for completing a lesson.
 * Contains analytics data and references.
 */
export class FinishLessonDto {
  /** Course ID */
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  courseId: number;

  /** Unit ID */
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  unitId: number;

  /** Level ID */
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  levelId: number;

  /** XP earned in this lesson */
  @IsInt()
  @Min(0)
  xpEarned: number;

  /** Time spent in seconds */
  @IsInt()
  @Min(0)
  durationSeconds: number;

  /** Accuracy percentage (0-100) */
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracyPercentage: number;
}
