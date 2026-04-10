/**
 * Prisma Transaction Type Definitions
 * Phase 23: Interactive Transactions Pattern
 *
 * This module provides type safety for transaction propagation across services.
 * The key insight: When inside a transaction, ALL database operations must use
 * the transaction context (tx), not the root PrismaService.
 */

import { Prisma, PrismaClient } from '@prisma/client';

/**
 * PrismaTx - Transaction Client Type
 *
 * This type represents the Prisma client instance available inside a transaction.
 * It excludes methods that shouldn't be called within a transaction context:
 * - $connect / $disconnect: Connection is managed by the transaction
 * - $on: Event listeners can't be added mid-transaction
 * - $transaction: Nested transactions aren't supported in PostgreSQL
 * - $use / $extends: Middleware and extensions are set at client level
 *
 * Usage:
 * ```typescript
 * async myMethod(data: MyData, tx?: PrismaTx) {
 *   const db = tx || this.prisma; // Use transaction if provided, else default client
 *   return db.model.create({ data });
 * }
 * ```
 */
export type PrismaTx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * TransactionOptions - Configuration for interactive transactions
 *
 * Use these to prevent transactions from holding locks too long:
 * - maxWait: Maximum time to wait for a transaction slot (ms)
 * - timeout: Maximum transaction duration (ms) - CRITICAL for deadlock prevention
 * - isolationLevel: PostgreSQL isolation level
 */
export interface TransactionOptions {
  /** Maximum time to wait for transaction slot in the pool (ms) */
  maxWait?: number;

  /** Maximum transaction duration before automatic rollback (ms)
   * CRITICAL: Keep this SHORT (5-10 seconds max) to prevent lock contention
   */
  timeout?: number;

  /** PostgreSQL isolation level - defaults to ReadCommitted
   * Use Serializable only when absolutely necessary (performance impact)
   */
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

/**
 * DEFAULT_TX_OPTIONS - Recommended defaults for most transactions
 *
 * Why these values:
 * - maxWait: 5000ms - If we can't get a slot in 5s, something is wrong
 * - timeout: 10000ms - No single transaction should take 10+ seconds
 *
 * For high-throughput scenarios (e.g., lesson completion during peak):
 * Consider reducing timeout to 5000ms
 */
export const DEFAULT_TX_OPTIONS: TransactionOptions = {
  maxWait: 5000,
  timeout: 10000,
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
};

/**
 * Type guard to check if we're inside a transaction context
 * Useful for debugging and assertions
 */
export function isTransactionContext(
  db: PrismaClient | PrismaTx,
): db is PrismaTx {
  // Transaction clients don't have the $transaction method
  return !('$transaction' in db && typeof db.$transaction === 'function');
}
