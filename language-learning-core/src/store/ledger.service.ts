import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTx } from '../common/prisma.types';
import { Currency } from '@prisma/client';

/**
 * Transaction Types - Semantic identifiers for ledger entries
 * Using string constants instead of enum for flexibility
 */
export const TransactionTypes = {
  STORE_PURCHASE: 'STORE_PURCHASE',
  LESSON_REWARD: 'LESSON_REWARD',
  LOOT_BOX: 'LOOT_BOX',
  DAILY_BONUS: 'DAILY_BONUS',
  STREAK_REWARD: 'STREAK_REWARD',
  ADMIN_GRANT: 'ADMIN_GRANT',
  ADMIN_REVOKE: 'ADMIN_REVOKE',
  REFUND: 'REFUND',
} as const;

export type TransactionType =
  (typeof TransactionTypes)[keyof typeof TransactionTypes];

/**
 * LedgerService - Immutable Transaction History Manager
 * Phase 22: Financial Audit Trail
 *
 * CRITICAL INVARIANTS:
 * 1. This table is APPEND-ONLY - never update or delete entries
 * 2. Every balance change MUST be logged here
 * 3. balance_after must match the actual wallet balance after operation
 *
 * Design Decision: No User FK
 * - Partitioned tables have FK limitations in PostgreSQL
 * - Legal retention: Transaction history must survive user deletion
 * - Performance: Reduces join overhead on high-volume writes
 */
@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log a financial transaction.
   *
   * IMPORTANT: This method accepts an optional `tx` parameter for transaction propagation.
   * When called inside a $transaction block, ALWAYS pass the tx context.
   *
   * @param userId - User who performed the transaction
   * @param currency - Currency type (GEMS, HEARTS)
   * @param amount - Transaction amount (negative for debits)
   * @param balanceAfter - Wallet balance AFTER this transaction
   * @param transactionType - Semantic type identifier
   * @param referenceId - Optional polymorphic reference (e.g., 'item_5')
   * @param tx - Optional transaction context for propagation
   */
  async logTransaction(
    userId: string,
    currency: Currency,
    amount: number,
    balanceAfter: number,
    transactionType: string,
    referenceId?: string,
    tx?: PrismaTx,
  ) {
    // Context Switch: Use transaction context if provided
    const db = tx || this.prisma;

    return db.transactionHistory.create({
      data: {
        userId,
        currency,
        amount,
        balanceAfter,
        transactionType,
        referenceId: referenceId || null,
        // createdAt is auto-set by DB, but we can override for testing
      },
    });
  }

  /**
   * Get user's transaction history with pagination.
   * Uses the optimized index: (user_id, created_at DESC)
   */
  async getUserTransactions(
    userId: string,
    options?: {
      currency?: Currency;
      limit?: number;
      offset?: number;
    },
  ) {
    const { currency, limit = 50, offset = 0 } = options || {};

    return this.prisma.transactionHistory.findMany({
      where: {
        userId,
        ...(currency && { currency }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get user's balance at a specific point in time.
   * Finds the most recent transaction before the given timestamp.
   *
   * Use Case: "What was user's balance on January 15th?"
   */
  async getBalanceAtTime(
    userId: string,
    currency: Currency,
    timestamp: Date,
  ): Promise<number | null> {
    const lastTransaction = await this.prisma.transactionHistory.findFirst({
      where: {
        userId,
        currency,
        createdAt: { lte: timestamp },
      },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });

    return lastTransaction?.balanceAfter ?? null;
  }

  /**
   * Calculate total earned/spent in a date range.
   * Useful for analytics and reporting.
   */
  async getTransactionSummary(
    userId: string,
    currency: Currency,
    startDate: Date,
    endDate: Date,
  ) {
    const transactions = await this.prisma.transactionHistory.findMany({
      where: {
        userId,
        currency,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        transactionType: true,
      },
    });

    const summary = {
      totalCredits: 0,
      totalDebits: 0,
      netChange: 0,
      transactionCount: transactions.length,
      byType: {} as Record<string, { count: number; total: number }>,
    };

    for (const tx of transactions) {
      if (tx.amount > 0) {
        summary.totalCredits += tx.amount;
      } else {
        summary.totalDebits += Math.abs(tx.amount);
      }
      summary.netChange += tx.amount;

      // Group by type
      if (!summary.byType[tx.transactionType]) {
        summary.byType[tx.transactionType] = { count: 0, total: 0 };
      }
      summary.byType[tx.transactionType].count++;
      summary.byType[tx.transactionType].total += tx.amount;
    }

    return summary;
  }
}
