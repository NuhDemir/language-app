/**
 * Transaction Utilities
 * Phase 24: Deadlock Protection & Timeout Strategy
 *
 * Provides retry mechanisms and utilities for handling transient database errors.
 */

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';

const logger = new Logger('TransactionUtil');

/**
 * Standard transaction options for all database operations.
 *
 * CRITICAL VALUES:
 * - maxWait: 2s - Don't wait too long for a connection slot
 * - timeout: 5s - No transaction should take longer than 5 seconds
 *
 * If either threshold is exceeded, something is wrong:
 * - maxWait exceeded → Connection pool exhausted (scale issue)
 * - timeout exceeded → Query issue, deadlock, or lock contention
 */
export const TX_OPTIONS = {
  /** Maximum time to wait for a connection from the pool (ms) */
  maxWait: 2000,

  /** Maximum transaction execution time (ms) - FAIL FAST principle */
  timeout: 5000,

  /** Isolation level - ReadCommitted is sufficient for most operations */
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
} as const;

/**
 * Extended transaction options for long-running operations.
 * Use sparingly - only for batch operations or migrations.
 */
export const TX_OPTIONS_EXTENDED = {
  maxWait: 5000,
  timeout: 30000, // 30 seconds
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
} as const;

/**
 * PostgreSQL and Prisma error codes for retry-eligible errors.
 */
const RETRYABLE_ERROR_CODES = [
  'P2034', // Prisma: Transaction failed due to a write conflict or a deadlock
  '40P01', // PostgreSQL: Deadlock detected
  '40001', // PostgreSQL: Serialization failure
];

/**
 * Check if an error is retryable (transient error that may succeed on retry).
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_ERROR_CODES.includes(error.code);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('deadlock') ||
      message.includes('could not serialize access') ||
      message.includes('lock wait timeout')
    );
  }

  return false;
}

/**
 * Execute an action with automatic retry on transient errors.
 *
 * Implements exponential backoff:
 * - 1st retry: 50ms delay
 * - 2nd retry: 100ms delay
 * - 3rd retry: 200ms delay
 *
 * Use this for critical operations that must succeed:
 * - Payment processing
 * - Inventory updates
 * - Balance modifications
 *
 * @param action - Async function to execute
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Result of the action
 * @throws Last error if all retries exhausted
 *
 * @example
 * ```typescript
 * const result = await runWithRetry(
 *   () => this.storeService.purchaseItem(userId, itemId),
 *   3
 * );
 * ```
 */
export async function runWithRetry<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      if (!isRetryableError(error) || attempt > maxRetries) {
        // Non-retryable error or exhausted retries
        throw lastError;
      }

      // Calculate delay with exponential backoff
      // 50ms, 100ms, 200ms, 400ms...
      const delay = 50 * Math.pow(2, attempt - 1);

      logger.warn(
        `Retryable error detected. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`,
        {
          errorCode:
            error instanceof Prisma.PrismaClientKnownRequestError
              ? error.code
              : 'UNKNOWN',
          errorMessage: lastError.message,
        },
      );

      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('Unexpected error in runWithRetry');
}

/**
 * Wraps an async action with a timeout.
 *
 * Unlike transaction timeout (which is DB-level), this is application-level.
 * Use for non-transactional operations that might hang.
 *
 * @param action - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result of the action
 * @throws TimeoutError if action exceeds timeout
 */
export async function withTimeout<T>(
  action: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    action(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ]);
}

/**
 * Custom error class for timeout errors.
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Sleep utility for delays.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decorator-style retry wrapper for class methods.
 *
 * @example
 * ```typescript
 * class MyService {
 *   private retryableAction = createRetryable(
 *     () => this.performAction(),
 *     3
 *   );
 * }
 * ```
 */
export function createRetryable<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
): () => Promise<T> {
  return () => runWithRetry(action, maxRetries);
}
