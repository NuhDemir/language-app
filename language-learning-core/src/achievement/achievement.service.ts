import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';

/**
 * Tier definition from JSONB structure.
 */
interface TierDefinition {
  goal: number;
  reward_gems: number;
}

/**
 * AchievementService - Manages user achievement progress and rewards.
 * Phase 28: JSONB-based tier system for flexible achievement definitions.
 *
 * Key Concepts:
 * - Achievements have multiple tiers stored as JSONB
 * - User progress is tracked separately and updated frequently
 * - Rewards are automatically granted when tier goals are reached
 */
@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all achievements with user's progress.
   */
  async getUserAchievements(userId: string) {
    const achievements = await this.prisma.achievement.findMany({
      orderBy: { id: 'asc' },
    });

    const userProgress = await this.prisma.userAchievement.findMany({
      where: { userId },
    });

    const progressMap = new Map(
      userProgress.map((p) => [p.achievementId, p]),
    );

    return achievements.map((achievement) => {
      const progress = progressMap.get(achievement.id);
      const tiers = achievement.tiers as unknown as Record<string, TierDefinition>;
      const tierKeys = Object.keys(tiers).sort((a, b) => parseInt(a) - parseInt(b));

      // Find current tier goal
      const completedTier = progress?.completedTier || 0;
      const nextTierKey = tierKeys.find((k) => parseInt(k) > completedTier);
      const nextTier = nextTierKey ? tiers[nextTierKey] : null;

      return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        currentProgress: progress?.currentProgress || 0,
        completedTier,
        totalTiers: tierKeys.length,
        nextTierGoal: nextTier?.goal || null,
        nextTierReward: nextTier?.reward_gems || null,
        isCompleted: !nextTier,
      };
    });
  }

  /**
   * Update progress for a specific achievement type.
   * Automatically grants rewards when tier goals are reached.
   *
   * @param userId - User to update
   * @param achievementCode - Achievement code (e.g., 'wildfire', 'sage')
   * @param progressValue - New progress value (absolute, not increment)
   * @returns Updated tier status and any rewards claimed
   */
  async updateProgress(
    userId: string,
    achievementCode: string,
    progressValue: number,
  ): Promise<{
    tiersCompleted: number[];
    totalReward: number;
    newCompletedTier: number;
  }> {
    // Get achievement definition
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) {
      this.logger.warn(`Achievement not found: ${achievementCode}`);
      return { tiersCompleted: [], totalReward: 0, newCompletedTier: 0 };
    }

    const tiers = achievement.tiers as unknown as Record<string, TierDefinition>;
    const tierKeys = Object.keys(tiers).sort((a, b) => parseInt(a) - parseInt(b));

    // Get or create user's progress
    let userAchievement = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!userAchievement) {
      userAchievement = await this.prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          currentProgress: 0,
          completedTier: 0,
        },
      });
    }

    // Check for newly completed tiers
    const previousCompletedTier = userAchievement.completedTier;
    const tiersCompleted: number[] = [];
    let totalReward = 0;
    let newCompletedTier = previousCompletedTier;

    for (const tierKey of tierKeys) {
      const tierNum = parseInt(tierKey);
      const tier = tiers[tierKey];

      // Skip already completed tiers
      if (tierNum <= previousCompletedTier) continue;

      // Check if this tier is now complete
      if (progressValue >= tier.goal) {
        tiersCompleted.push(tierNum);
        totalReward += tier.reward_gems;
        newCompletedTier = tierNum;
      } else {
        // Stop at first incomplete tier
        break;
      }
    }

    // Update progress and grant rewards if any
    if (tiersCompleted.length > 0) {
      await this.prisma.$transaction([
        // Update achievement progress
        this.prisma.userAchievement.update({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
          data: {
            currentProgress: progressValue,
            completedTier: newCompletedTier,
          },
        }),
        // Add gem reward to wallet
        this.prisma.userWallet.update({
          where: {
            userId_currency: { userId, currency: Currency.GEMS },
          },
          data: {
            balance: { increment: totalReward },
          },
        }),
        // Log reward transaction
        this.prisma.transactionHistory.create({
          data: {
            userId,
            currency: Currency.GEMS,
            amount: totalReward,
            balanceAfter: 0, // Will be updated by trigger or calculated later
            transactionType: 'ACHIEVEMENT_REWARD',
            referenceId: `${achievementCode}_tier_${newCompletedTier}`,
          },
        }),
      ]);

      this.logger.log(
        `User ${userId} completed ${achievementCode} tier ${newCompletedTier}, reward: ${totalReward} gems`,
      );
    } else {
      // Just update progress without rewards
      await this.prisma.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          currentProgress: progressValue,
        },
      });
    }

    return { tiersCompleted, totalReward, newCompletedTier };
  }

  /**
   * Increment progress for an achievement (convenience method).
   * Commonly used for counter-based achievements.
   */
  async incrementProgress(
    userId: string,
    achievementCode: string,
    amount: number = 1,
  ) {
    // Get current progress
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return null;

    const userAchievement = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    const currentProgress = userAchievement?.currentProgress || 0;
    return this.updateProgress(userId, achievementCode, currentProgress + amount);
  }

  /**
   * Get all achievement definitions (admin/debug).
   */
  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: { id: 'asc' },
    });
  }
}
