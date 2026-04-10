import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementService } from './achievement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/** JWT payload interface */
interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * AchievementController - REST endpoints for achievement system.
 */
@ApiTags('Achievement')
@ApiBearerAuth()
@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Get all achievements with user's progress.
   */
  @Get()
  @ApiOperation({ summary: 'Get all achievements with user progress' })
  async getUserAchievements(@CurrentUser() user: JwtPayload) {
    return this.achievementService.getUserAchievements(user.sub);
  }

  /**
   * Get all achievement definitions (no user progress).
   */
  @Get('definitions')
  @ApiOperation({ summary: 'Get all achievement definitions' })
  async getAllDefinitions() {
    return this.achievementService.getAllAchievements();
  }

  /**
   * Manually update achievement progress (admin/testing).
   */
  @Post(':code/progress')
  @ApiOperation({ summary: 'Update achievement progress' })
  async updateProgress(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
    @Body() body: { progressValue: number },
  ) {
    return this.achievementService.updateProgress(
      user.sub,
      code,
      body.progressValue,
    );
  }
}
