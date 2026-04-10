import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TX_OPTIONS } from '../common/utils/transaction.util';

/**
 * LeagueService - Manages competitive league system.
 * Phase 25: Cohort-based bucketing for fair competition.
 *
 * Key Concepts:
 * - Users are placed in cohorts of max 50 players
 * - Each cohort competes for weekly rankings
 * - Top performers get promoted, bottom performers demoted
 */
@Injectable()
export class LeagueService {
  private readonly logger = new Logger(LeagueService.name);
  private readonly MAX_COHORT_SIZE = 50;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create a cohort for a user to join.
   * Implements "Lazy Allocation" pattern - cohorts created on-demand.
   *
   * @param leagueTier - User's current league tier (1-5)
   * @param weekStartDate - Monday of the target week
   * @returns Cohort ID to join
   */
  async getOrCreateCohort(
    leagueTier: number,
    weekStartDate: Date,
  ): Promise<string> {
    // Find an active (non-full) cohort for this tier and week
    const existingCohort = await this.prisma.leagueCohort.findFirst({
      where: {
        leagueTier,
        weekStartDate,
        isActive: true,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    // If found and not full, return it
    if (existingCohort && existingCohort._count.members < this.MAX_COHORT_SIZE) {
      return existingCohort.id;
    }

    // If found but full, mark it as inactive
    if (existingCohort && existingCohort._count.members >= this.MAX_COHORT_SIZE) {
      await this.prisma.leagueCohort.update({
        where: { id: existingCohort.id },
        data: { isActive: false },
      });
    }

    // Create new cohort
    const newCohort = await this.prisma.leagueCohort.create({
      data: {
        leagueTier,
        weekStartDate,
        isActive: true,
      },
    });

    this.logger.log(
      `Created new cohort ${newCohort.id} for Tier ${leagueTier}, Week ${weekStartDate.toISOString()}`,
    );

    return newCohort.id;
  }

  /**
   * Assign user to a cohort for the current week.
   * Called when user completes their first lesson of the week.
   *
   * @param userId - User to assign
   * @param leagueTier - User's current league tier
   */
  async assignUserToCohort(userId: string, leagueTier: number): Promise<void> {
    const weekStartDate = this.getWeekStartDate();

    // Check if user already assigned this week
    const existingMembership = await this.prisma.leagueMembership.findFirst({
      where: {
        userId,
        cohort: {
          weekStartDate,
        },
      },
    });

    if (existingMembership) {
      // Already assigned, nothing to do
      return;
    }

    // Use transaction for atomicity
    await this.prisma.$transaction(
      async (tx) => {
        // Get or create cohort
        const cohortId = await this.getOrCreateCohortInTx(
          tx,
          leagueTier,
          weekStartDate,
        );

        // Create membership
        await tx.leagueMembership.create({
          data: {
            cohortId,
            userId,
            currentWeeklyXp: 0,
          },
        });
      },
      TX_OPTIONS,
    );

    this.logger.log(`User ${userId} assigned to cohort for Tier ${leagueTier}`);
  }

  /**
   * Internal helper: Get or create cohort within transaction context.
   */
  private async getOrCreateCohortInTx(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    leagueTier: number,
    weekStartDate: Date,
  ): Promise<string> {
    // Find active cohort with member count
    const cohorts = await tx.leagueCohort.findMany({
      where: {
        leagueTier,
        weekStartDate,
        isActive: true,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
      take: 1,
    });

    const existingCohort = cohorts[0];

    if (existingCohort && existingCohort._count.members < this.MAX_COHORT_SIZE) {
      return existingCohort.id;
    }

    // Mark full cohort as inactive
    if (existingCohort) {
      await tx.leagueCohort.update({
        where: { id: existingCohort.id },
        data: { isActive: false },
      });
    }

    // Create new
    const newCohort = await tx.leagueCohort.create({
      data: {
        leagueTier,
        weekStartDate,
        isActive: true,
      },
    });

    return newCohort.id;
  }

  /**
   * Add XP to user's weekly total.
   * Called after lesson completion, practice session, etc.
   *
   * @param userId - User who earned XP
   * @param xpAmount - XP to add
   */
  async addWeeklyXp(userId: string, xpAmount: number): Promise<void> {
    const weekStartDate = this.getWeekStartDate();

    // Find user's membership for this week
    const membership = await this.prisma.leagueMembership.findFirst({
      where: {
        userId,
        cohort: {
          weekStartDate,
        },
      },
      include: {
        cohort: true,
      },
    });

    if (!membership) {
      // User not in a cohort this week - assign them first (Tier 1 default)
      await this.assignUserToCohort(userId, 1);
      return this.addWeeklyXp(userId, xpAmount);
    }

    // Update weekly XP
    await this.prisma.leagueMembership.update({
      where: {
        cohortId_userId: {
          cohortId: membership.cohortId,
          userId,
        },
      },
      data: {
        currentWeeklyXp: { increment: xpAmount },
      },
    });
  }

  /**
   * Get leaderboard for a cohort.
   * Uses the idx_league_ranking index for zero-cost sort.
   *
   * @param cohortId - Cohort to get rankings for
   * @param limit - Number of results (default 50)
   */
  async getLeaderboard(
    cohortId: string,
    limit: number = 50,
  ): Promise<
    Array<{
      rank: number;
      userId: string;
      username: string;
      avatar: string | null;
      currentWeeklyXp: number;
    }>
  > {
    const members = await this.prisma.leagueMembership.findMany({
      where: { cohortId },
      orderBy: { currentWeeklyXp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            settings: true,
          },
        },
      },
    });

    return members.map((m, index) => ({
      rank: index + 1,
      userId: m.user.id,
      username: m.user.username,
      avatar: (m.user.settings as Record<string, unknown>)?.avatar as string | null,
      currentWeeklyXp: m.currentWeeklyXp,
    }));
  }

  /**
   * Get user's current league status.
   */
  async getUserLeagueStatus(userId: string) {
    const weekStartDate = this.getWeekStartDate();

    const membership = await this.prisma.leagueMembership.findFirst({
      where: {
        userId,
        cohort: {
          weekStartDate,
        },
      },
      include: {
        cohort: {
          include: {
            league: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    // Get user's rank in cohort
    const higherRanked = await this.prisma.leagueMembership.count({
      where: {
        cohortId: membership.cohortId,
        currentWeeklyXp: { gt: membership.currentWeeklyXp },
      },
    });

    return {
      leagueName: membership.cohort.league.name,
      leagueTier: membership.cohort.leagueTier,
      cohortId: membership.cohortId,
      cohortSize: membership.cohort._count.members,
      currentWeeklyXp: membership.currentWeeklyXp,
      rank: higherRanked + 1,
      promotionThreshold: membership.cohort.league.promotionThreshold,
      demotionThreshold: membership.cohort.league.demotionThreshold,
    };
  }

  /**
   * Get all leagues.
   */
  async getAllLeagues() {
    return this.prisma.league.findMany({
      orderBy: { tier: 'asc' },
    });
  }

  /**
   * Helper: Get Monday of current week (00:00:00 UTC).
   */
  private getWeekStartDate(): Date {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is day 1

    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);

    return monday;
  }
}
