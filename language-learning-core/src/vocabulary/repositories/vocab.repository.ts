import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Repository for vocabulary progress queries.
 * Optimized for SRS algorithm operations.
 */
@Injectable()
export class VocabRepository {
  private readonly logger = new Logger(VocabRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get words due for review (next_review_at <= NOW).
   * Uses covering index for Index Only Scan performance.
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @param limit - Max words to return (default: 10)
   * @returns Words ready for SRS review
   */
  async getDueWords(userId: string, courseId: bigint, limit = 10) {
    this.logger.log(
      `Fetching due words for user ${userId}, course ${courseId}`,
    );

    return this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        courseId,
        nextReviewAt: { lte: new Date() },
      },
      select: {
        wordToken: true,
        stability: true,
        difficulty: true,
        nextReviewAt: true,
      },
      orderBy: {
        nextReviewAt: 'asc', // Most urgent first
      },
      take: limit,
    });
  }

  /**
   * Get all vocabulary for a user in a course.
   */
  async getUserVocabulary(userId: string, courseId: bigint) {
    return this.prisma.userVocabularyProgress.findMany({
      where: { userId, courseId },
      orderBy: { wordToken: 'asc' },
    });
  }

  /**
   * Upsert vocabulary progress (create or update).
   */
  async upsertProgress(
    userId: string,
    courseId: bigint,
    wordToken: string,
    data: {
      stability: number;
      difficulty: number;
      repetitionCount: number;
      nextReviewAt: Date;
    },
  ) {
    return this.prisma.userVocabularyProgress.upsert({
      where: {
        userId_courseId_wordToken: { userId, courseId, wordToken },
      },
      create: {
        userId,
        courseId,
        wordToken,
        ...data,
      },
      update: {
        ...data,
        lastReviewedAt: new Date(),
      },
    });
  }
}
