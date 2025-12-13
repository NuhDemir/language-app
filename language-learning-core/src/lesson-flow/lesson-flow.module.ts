import { Module } from '@nestjs/common';
import { LessonFlowService } from './lesson-flow.service';

/**
 * Module for lesson flow operations.
 * Handles atomic lesson completion with transactions.
 */
@Module({
  providers: [LessonFlowService],
  exports: [LessonFlowService],
})
export class LessonFlowModule {}
