import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';
import { TX_OPTIONS } from '../common/utils/transaction.util';

/**
 * Store Service - Handles item purchases with pessimistic locking.
 * PDF Reference: Page 18-19 (Double-Spend Protection)
 *
 * CRITICAL: Uses SELECT ... FOR UPDATE to prevent race conditions.
 * All database operations MUST use the transaction context (tx), not this.prisma.
 */
@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Purchase an item from the store using pessimistic locking.
   *
   * Race Condition Prevention:
   * 1. Lock the wallet row with SELECT FOR UPDATE
   * 2. While locked, other requests wait until COMMIT/ROLLBACK
   * 3. After first request completes, second reads updated balance
   * 4. Second request fails with "Insufficient funds" if balance is low
   *
   * @param userId - The user making the purchase
   * @param itemId - The item to purchase
   * @returns Purchase result with remaining balance
   */
  async purchaseItem(
    userId: string,
    itemId: number,
  ): Promise<{ success: boolean; remainingBalance: number }> {
    // Interactive Transaction with timeout protection (Phase 24)
    // TX_OPTIONS: maxWait=2s, timeout=5s, ReadCommitted isolation
    return this.prisma.$transaction(
      async (tx) => {
        // ================================================================
        // STEP 0: Fetch item details (no lock needed - static catalog data)
        // ================================================================
        const item = await tx.item.findUnique({
          where: { id: itemId },
        });

        if (!item) {
          throw new NotFoundException(`Item with ID ${itemId} not found`);
        }

        // ================================================================
        // STEP 1: PESSIMISTIC LOCK - Lock wallet row with FOR UPDATE
        // ================================================================
        // CRITICAL: This is raw SQL because Prisma doesn't support FOR UPDATE natively.
        // The lock is held until the transaction commits or rolls back.
        // Any concurrent request for the same wallet will WAIT here.
        //
        // SQL Injection Protection:
        // - Using template literals with Prisma's $queryRaw automatically parameterizes
        // - ${userId}::uuid casts the string to UUID type
        // - ${'GEMS'}::"Currency" casts to the PostgreSQL enum type
        const walletResults = await tx.$queryRaw<Array<{ balance: number }>>`
          SELECT balance 
          FROM user_wallets 
          WHERE user_id = ${userId}::uuid 
            AND currency = ${'GEMS'}::"Currency"
          FOR UPDATE
        `;

        // Handle case where wallet doesn't exist
        if (walletResults.length === 0) {
          throw new BadRequestException(
            'Wallet not found. Please initialize your wallet first.',
          );
        }

        const currentBalance = walletResults[0].balance;

        // ================================================================
        // STEP 2: Balance validation (application-level check)
        // ================================================================
        // Even with DB-level CHECK constraint, we validate here for:
        // 1. Clear error messages to the user
        // 2. Early exit without hitting the constraint
        if (currentBalance < item.costGems) {
          throw new BadRequestException(
            `Insufficient funds. Required: ${item.costGems} GEMS, Available: ${currentBalance} GEMS`,
          );
        }

        // ================================================================
        // STEP 3: Deduct balance (safe - row is locked)
        // ================================================================
        // The decrement is safe because:
        // 1. Row is locked by FOR UPDATE - no other transaction can modify
        // 2. We validated balance >= cost in Step 2
        // 3. DB has CHECK constraint as final protection
        await tx.userWallet.update({
          where: {
            userId_currency: {
              userId,
              currency: Currency.GEMS,
            },
          },
          data: {
            balance: { decrement: item.costGems },
          },
        });

        // ================================================================
        // STEP 4: Add to inventory (upsert pattern)
        // ================================================================
        // If user already owns this item -> increment quantity
        // If user doesn't own this item -> create new inventory record
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

        // ================================================================
        // STEP 5: Log transaction to immutable ledger (Phase 22)
        // ================================================================
        // CRITICAL: This creates an audit trail for all financial operations
        // - amount is NEGATIVE because this is a debit (spending)
        // - balanceAfter captures the snapshot after this transaction
        const newBalance = currentBalance - item.costGems;

        await tx.transactionHistory.create({
          data: {
            userId,
            currency: Currency.GEMS,
            amount: -item.costGems, // Negative for debit
            balanceAfter: newBalance,
            transactionType: 'STORE_PURCHASE',
            referenceId: `item_${itemId}`,
          },
        });

        // ================================================================
        // STEP 6: Return success (Transaction will auto-commit)
        // ================================================================
        return {
          success: true,
          remainingBalance: newBalance,
        };
      },
      TX_OPTIONS, // Phase 24: Standard transaction options (2s maxWait, 5s timeout)
    );
  }

  /**
   * Get all items available in the store.
   * Static catalog data - no locking needed.
   */
  async getStoreItems() {
    return this.prisma.item.findMany({
      orderBy: { costGems: 'asc' },
    });
  }

  /**
   * Get a specific item by ID.
   */
  async getItemById(itemId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    return item;
  }

  /**
   * Get user's wallet balance for a specific currency.
   */
  async getWalletBalance(
    userId: string,
    currency: Currency = Currency.GEMS,
  ): Promise<{ currency: Currency; balance: number }> {
    const wallet = await this.prisma.userWallet.findUnique({
      where: {
        userId_currency: { userId, currency },
      },
    });

    if (!wallet) {
      // Return 0 balance if wallet doesn't exist
      return { currency, balance: 0 };
    }

    return { currency, balance: wallet.balance };
  }

  /**
   * Initialize a wallet for a user (creates if not exists).
   * Used during user registration or first store visit.
   */
  async initializeWallet(
    userId: string,
    currency: Currency = Currency.GEMS,
    initialBalance: number = 0,
  ) {
    return this.prisma.userWallet.upsert({
      where: {
        userId_currency: { userId, currency },
      },
      create: {
        userId,
        currency,
        balance: initialBalance,
      },
      update: {}, // Don't modify existing wallet
    });
  }

  /**
   * Add gems to a user's wallet.
   * Used for purchases, rewards, etc.
   */
  async addGems(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Ensure wallet exists first
    await this.initializeWallet(userId, Currency.GEMS, 0);

    return this.prisma.userWallet.update({
      where: {
        userId_currency: { userId, currency: Currency.GEMS },
      },
      data: {
        balance: { increment: amount },
      },
    });
  }

  /**
   * Get user's inventory.
   */
  async getUserInventory(userId: string) {
    return this.prisma.userInventory.findMany({
      where: { userId },
      include: {
        item: true,
      },
      orderBy: { acquiredAt: 'desc' },
    });
  }
}
