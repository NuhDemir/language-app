import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';
import { TX_OPTIONS } from '../common/utils/transaction.util';

/**
 * LootBoxService - Handles loot box purchases and rewards.
 * Phase 27: Weighted Randomness via Stored Procedure.
 *
 * Key Features:
 * - Uses PostgreSQL's pick_loot_item() function for weighted random selection
 * - Handles GEMS, ITEM, XP reward types
 * - Logs all transactions to ledger
 */
@Injectable()
export class LootBoxService {
  private readonly logger = new Logger(LootBoxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available loot boxes.
   */
  async getAvailableLootBoxes() {
    return this.prisma.lootBox.findMany({
      where: { isActive: true },
      orderBy: { costGems: 'asc' },
    });
  }

  /**
   * Get loot box details with rates.
   */
  async getLootBoxDetails(boxId: number) {
    const box = await this.prisma.lootBox.findUnique({
      where: { id: boxId },
      include: {
        rates: {
          orderBy: { weight: 'desc' },
        },
      },
    });

    if (!box) {
      throw new NotFoundException(`Loot box ${boxId} not found`);
    }

    // Calculate percentages for display
    const totalWeight = box.rates.reduce((sum, r) => sum + r.weight, 0);
    const ratesWithPercentage = box.rates.map((rate) => ({
      ...rate,
      percentage: ((rate.weight / totalWeight) * 100).toFixed(2) + '%',
    }));

    return {
      ...box,
      rates: ratesWithPercentage,
      totalWeight,
    };
  }

  /**
   * Open a loot box and receive a reward.
   * Uses stored procedure for weighted random selection.
   *
   * @param userId - User opening the box
   * @param boxId - Loot box to open
   * @returns Reward details
   */
  async openLootBox(
    userId: string,
    boxId: number,
  ): Promise<{
    success: boolean;
    reward: { type: string; value: string; isRare: boolean };
    remainingBalance: number;
  }> {
    return this.prisma.$transaction(
      async (tx) => {
        // Step 1: Get box details
        const box = await tx.lootBox.findUnique({
          where: { id: boxId },
        });

        if (!box || !box.isActive) {
          throw new NotFoundException(`Loot box ${boxId} not found or inactive`);
        }

        // Step 2: Lock wallet and check balance
        const walletResults = await tx.$queryRaw<Array<{ balance: number }>>`
          SELECT balance 
          FROM user_wallets 
          WHERE user_id = ${userId}::uuid 
            AND currency = ${'GEMS'}::"Currency"
          FOR UPDATE
        `;

        if (walletResults.length === 0) {
          throw new BadRequestException('Wallet not found');
        }

        const currentBalance = walletResults[0].balance;

        if (currentBalance < box.costGems) {
          throw new BadRequestException(
            `Insufficient funds. Required: ${box.costGems} GEMS, Available: ${currentBalance} GEMS`,
          );
        }

        // Step 3: Deduct cost
        await tx.userWallet.update({
          where: {
            userId_currency: {
              userId,
              currency: Currency.GEMS,
            },
          },
          data: {
            balance: { decrement: box.costGems },
          },
        });

        // Step 4: Call stored procedure for weighted random selection
        const result = await tx.$queryRaw<Array<{ pick_loot_item: string }>>`
          SELECT pick_loot_item(${boxId})
        `;

        const winningValue = result[0]?.pick_loot_item;

        if (!winningValue) {
          throw new BadRequestException('Loot box is empty or invalid');
        }

        // Step 5: Get reward details
        const rewardRate = await tx.lootBoxRate.findFirst({
          where: {
            lootBoxId: boxId,
            itemValue: winningValue,
          },
        });

        // Step 6: Process reward based on type
        await this.processReward(tx, userId, rewardRate!);

        // Step 7: Log transaction
        const newBalance = currentBalance - box.costGems;
        await tx.transactionHistory.create({
          data: {
            userId,
            currency: Currency.GEMS,
            amount: -box.costGems,
            balanceAfter: newBalance,
            transactionType: 'LOOT_BOX',
            referenceId: `lootbox_${boxId}_${winningValue}`,
          },
        });

        this.logger.log(
          `User ${userId} opened box ${boxId}, won: ${rewardRate?.itemType} - ${winningValue}`,
        );

        return {
          success: true,
          reward: {
            type: rewardRate?.itemType || 'UNKNOWN',
            value: winningValue,
            isRare: rewardRate?.isRare || false,
          },
          remainingBalance: newBalance,
        };
      },
      TX_OPTIONS,
    );
  }

  /**
   * Process reward based on type.
   */
  private async processReward(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    userId: string,
    rate: { itemType: string; itemValue: string },
  ) {
    switch (rate.itemType) {
      case 'GEMS':
        // Add gems to wallet
        const gemsAmount = parseInt(rate.itemValue, 10);
        await tx.userWallet.update({
          where: {
            userId_currency: { userId, currency: Currency.GEMS },
          },
          data: {
            balance: { increment: gemsAmount },
          },
        });

        // Log the gem gain
        const wallet = await tx.userWallet.findUnique({
          where: { userId_currency: { userId, currency: Currency.GEMS } },
        });

        await tx.transactionHistory.create({
          data: {
            userId,
            currency: Currency.GEMS,
            amount: gemsAmount,
            balanceAfter: wallet?.balance || gemsAmount,
            transactionType: 'LOOT_BOX_REWARD',
            referenceId: `gems_${gemsAmount}`,
          },
        });
        break;

      case 'ITEM':
        // Add item to inventory
        const itemId = parseInt(rate.itemValue.replace('item_', ''), 10);
        await tx.userInventory.upsert({
          where: {
            uq_user_item: { userId, itemId },
          },
          create: {
            userId,
            itemId,
            quantity: 1,
          },
          update: {
            quantity: { increment: 1 },
          },
        });
        break;

      case 'XP':
        // Add XP to user
        const xpAmount = parseInt(rate.itemValue, 10);
        await tx.user.update({
          where: { id: userId },
          data: {
            totalXp: { increment: xpAmount },
          },
        });
        break;

      default:
        this.logger.warn(`Unknown reward type: ${rate.itemType}`);
    }
  }
}
