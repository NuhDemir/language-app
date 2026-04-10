import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeagueService } from './league.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/** JWT payload interface */
interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * LeagueController - REST endpoints for league system.
 * All endpoints require JWT authentication.
 */
@ApiTags('League')
@ApiBearerAuth()
@Controller('league')
@UseGuards(JwtAuthGuard)
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  /**
   * Get all available leagues.
   */
  @Get('tiers')
  @ApiOperation({ summary: 'Get all league tiers' })
  async getAllLeagues() {
    return this.leagueService.getAllLeagues();
  }

  /**
   * Get current user's league status.
   */
  @Get('status')
  @ApiOperation({ summary: 'Get current user league status' })
  async getUserStatus(@CurrentUser() user: JwtPayload) {
    const status = await this.leagueService.getUserLeagueStatus(user.sub);

    if (!status) {
      return {
        enrolled: false,
        message: 'Complete a lesson to join the league!',
      };
    }

    return {
      enrolled: true,
      ...status,
    };
  }

  /**
   * Get leaderboard for user's current cohort.
   */
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard for current cohort' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLeaderboard(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    const status = await this.leagueService.getUserLeagueStatus(user.sub);

    if (!status) {
      return {
        enrolled: false,
        leaderboard: [],
      };
    }

    const leaderboard = await this.leagueService.getLeaderboard(
      status.cohortId,
      limit ? parseInt(limit, 10) : 50,
    );

    return {
      leagueName: status.leagueName,
      leagueTier: status.leagueTier,
      cohortSize: status.cohortSize,
      myRank: status.rank,
      myXp: status.currentWeeklyXp,
      leaderboard,
    };
  }

  /**
   * Get leaderboard for a specific cohort (admin/debug).
   */
  @Get('cohort/:cohortId/leaderboard')
  @ApiOperation({ summary: 'Get leaderboard for specific cohort' })
  async getCohortLeaderboard(
    @Param('cohortId') cohortId: string,
    @Query('limit') limit?: string,
  ) {
    return this.leagueService.getLeaderboard(
      cohortId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * Join the league (assign to cohort).
   * Typically called automatically on first lesson completion.
   */
  @Post('join')
  @ApiOperation({ summary: 'Join the league (assigns to cohort)' })
  async joinLeague(@CurrentUser() user: JwtPayload) {
    // Default to Bronze (tier 1) for new players
    await this.leagueService.assignUserToCohort(user.sub, 1);

    return {
      success: true,
      message: 'Welcome to the Bronze League!',
    };
  }
}
