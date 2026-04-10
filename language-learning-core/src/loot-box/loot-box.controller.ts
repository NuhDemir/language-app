import { Controller, Get, Post, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LootBoxService } from './loot-box.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/** JWT payload interface */
interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * LootBoxController - REST endpoints for loot box system.
 */
@ApiTags('LootBox')
@ApiBearerAuth()
@Controller('loot-box')
@UseGuards(JwtAuthGuard)
export class LootBoxController {
  constructor(private readonly lootBoxService: LootBoxService) {}

  /**
   * Get all available loot boxes.
   */
  @Get()
  @ApiOperation({ summary: 'Get all available loot boxes' })
  async getAvailableLootBoxes() {
    return this.lootBoxService.getAvailableLootBoxes();
  }

  /**
   * Get loot box details with drop rates.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get loot box details with drop rates' })
  async getLootBoxDetails(@Param('id', ParseIntPipe) id: number) {
    return this.lootBoxService.getLootBoxDetails(id);
  }

  /**
   * Open a loot box and receive reward.
   */
  @Post(':id/open')
  @ApiOperation({ summary: 'Open a loot box' })
  async openLootBox(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lootBoxService.openLootBox(user.sub, id);
  }
}
