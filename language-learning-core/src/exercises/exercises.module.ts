import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';

/**
 * Exercises module for managing exercise content.
 * Includes Zod validation for JSONB content.
 */
@Module({
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
