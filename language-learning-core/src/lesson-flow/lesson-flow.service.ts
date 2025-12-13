import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinishLessonDto } from './dto';

/**
 * Service for lesson flow operations.
 * Handles atomic lesson completion with transactions.
 */
@Injectable()
export class LessonFlowService {
  private readonly logger = new Logger(LessonFlowService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Complete a lesson with atomic transaction.
   * Updates lesson completion log and user XP in a single transaction.
   *
   * @param userId - User ID completing the lesson
   * @param dto - Lesson completion data
   * @returns Updated user XP and lesson log ID
   */
  async finishLesson(userId: string, dto: FinishLessonDto) {
    this.logger.log(
      `Starting lesson completion for user ${userId}, course ${dto.courseId}`,
    );

    // Interactive Transaction: All operations succeed or all rollback
    return this.prisma.$transaction(
      async (tx) => {
        // STEP 1: Create lesson completion log (goes to partitioned table)
        const completionLog = await tx.lessonCompletion.create({
          data: {
            userId,
            courseId: BigInt(dto.courseId),
            unitId: BigInt(dto.unitId),
            levelId: BigInt(dto.levelId),
            xpEarned: dto.xpEarned,
            durationSeconds: dto.durationSeconds,
            accuracyPercentage: dto.accuracyPercentage,
            completedAt: new Date(), // Partition key
          },
        });

        this.logger.debug(`Created completion log: ${completionLog.id}`);

        // STEP 2: Update user profile with atomic increment
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            totalXp: { increment: dto.xpEarned },
            lastActivity: new Date(),
          },
        });

        this.logger.debug(`Updated user XP: ${updatedUser.totalXp}`);

        // STEP 3: Update enrollment progress data (optional)
        await tx.enrollment.updateMany({
          where: {
            userId,
            courseId: BigInt(dto.courseId),
          },
          data: {
            // Update last activity on enrollment
          },
        });

        this.logger.log(
          `Lesson completed successfully. New total XP: ${updatedUser.totalXp}`,
        );

        return {
          newTotalXp: updatedUser.totalXp.toString(),
          lessonLogId: completionLog.id.toString(),
        };
      },
      {
        maxWait: 5000, // Max wait for connection from pool
        timeout: 10000, // Max transaction duration
      },
    );
  }

  /**
   * Get user's recent lesson completions.
   */
  async getRecentCompletions(userId: string, limit = 10) {
    return this.prisma.lessonCompletion.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }
}
