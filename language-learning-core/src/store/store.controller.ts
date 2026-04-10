import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { PurchaseItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
}

@ApiTags('Store')
@Controller('store')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('items')
  @ApiOperation({ summary: 'Get all store items' })
  @ApiResponse({ status: 200, description: 'List of all available items' })
  async getStoreItems() {
    return this.storeService.getStoreItems();
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get a specific item by ID' })
  @ApiResponse({ status: 200, description: 'Item details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getItem(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.getItemById(id);
  }

  @Post('purchase')
  @ApiOperation({
    summary: 'Purchase an item',
    description:
      'Purchases an item using pessimistic locking to prevent double-spend attacks',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase successful',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        remainingBalance: { type: 'number', example: 800 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient funds or wallet not found' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async purchaseItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PurchaseItemDto,
  ) {
    return this.storeService.purchaseItem(user.sub, dto.itemId);
  }

  @Get('wallet')
  @ApiOperation({ summary: 'Get current wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance',
    schema: {
      properties: {
        currency: { type: 'string', example: 'GEMS' },
        balance: { type: 'number', example: 1000 },
      },
    },
  })
  async getWallet(@CurrentUser() user: JwtPayload) {
    return this.storeService.getWalletBalance(user.sub);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get user inventory' })
  @ApiResponse({ status: 200, description: 'List of owned items' })
  async getInventory(@CurrentUser() user: JwtPayload) {
    return this.storeService.getUserInventory(user.sub);
  }

  @Post('wallet/add-gems')
  @ApiOperation({
    summary: 'Add gems to wallet (for testing/rewards)',
    description: 'Adds gems to the user wallet. In production, this should be protected.',
  })
  @ApiResponse({ status: 200, description: 'Gems added successfully' })
  async addGems(
    @CurrentUser() user: JwtPayload,
    @Body('amount', ParseIntPipe) amount: number,
  ) {
    return this.storeService.addGems(user.sub, amount);
  }
}
