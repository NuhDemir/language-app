import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Partition Maintenance Service
 * Automatically creates monthly partitions for partitioned tables:
 * - lesson_completions (Phase 14)
 * - transaction_history (Phase 22)
 */
@Injectable()
export class PartitionMaintenanceService {
  private readonly logger = new Logger(PartitionMaintenanceService.name);

  // List of partitioned tables to maintain
  private readonly partitionedTables = [
    'lesson_completions',
    'transaction_history',
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates partitions for all partitioned tables for the next month.
   * Runs on the 15th of every month at midnight.
   * This ensures the partition exists well before it's needed.
   */
  @Cron('0 0 15 * *')
  async createNextMonthPartitions() {
    this.logger.log('Starting monthly partition maintenance...');

    // Calculate next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const year = nextMonth.getFullYear();
    const month = nextMonth.getMonth() + 1;

    for (const tableName of this.partitionedTables) {
      try {
        await this.createPartitionForTable(tableName, year, month);
        this.logger.log(`Partition created for ${tableName} (${year}-${month})`);
      } catch (error) {
        this.logger.error(
          `Failed to create partition for ${tableName}`,
          error instanceof Error ? error.stack : error,
        );
        // Continue with other tables even if one fails
      }
    }

    this.logger.log('Monthly partition maintenance completed.');
  }

  /**
   * Creates a partition for a specific table and month.
   * @param tableName - The parent table name (e.g., 'lesson_completions')
   * @param year - Target year
   * @param month - Target month (1-12)
   */
  async createPartitionForTable(
    tableName: string,
    year: number,
    month: number,
  ) {
    const monthStr = String(month).padStart(2, '0');
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthStr = String(nextMonth).padStart(2, '0');

    const startStr = `${year}-${monthStr}-01 00:00:00+00`;
    const endStr = `${nextYear}-${nextMonthStr}-01 00:00:00+00`;
    const partitionName = `${tableName}_y${year}m${monthStr}`;

    this.logger.log(
      `Creating partition: ${partitionName} for range [${startStr}, ${endStr})`,
    );

    // Use IF NOT EXISTS for idempotency
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${partitionName}" 
      PARTITION OF "${tableName}"
      FOR VALUES FROM ('${startStr}') TO ('${endStr}');
    `);

    return { partitionName, range: { from: startStr, to: endStr } };
  }

  /**
   * Manual method to create a partition for a specific month.
   * Useful for backfilling or manual intervention.
   *
   * @deprecated Use createPartitionForTable instead
   */
  async createPartitionForMonth(year: number, month: number) {
    return this.createPartitionForTable('lesson_completions', year, month);
  }

  /**
   * Verify all partitioned tables have necessary future partitions.
   * Can be called on application startup or via admin endpoint.
   */
  async verifyPartitions() {
    const results: Record<string, { exists: boolean; partitionName: string }[]> =
      {};

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Check current and next 2 months
    const monthsToCheck = [
      { year: currentYear, month: currentMonth },
      {
        year: currentMonth === 12 ? currentYear + 1 : currentYear,
        month: currentMonth === 12 ? 1 : currentMonth + 1,
      },
      {
        year: currentMonth >= 11 ? currentYear + 1 : currentYear,
        month: currentMonth >= 11 ? currentMonth - 10 : currentMonth + 2,
      },
    ];

    for (const tableName of this.partitionedTables) {
      results[tableName] = [];

      for (const { year, month } of monthsToCheck) {
        const monthStr = String(month).padStart(2, '0');
        const partitionName = `${tableName}_y${year}m${monthStr}`;

        try {
          // Check if partition exists
          const exists = await this.prisma.$queryRaw<Array<{ exists: boolean }>>`
            SELECT EXISTS (
              SELECT 1 FROM pg_class WHERE relname = ${partitionName}
            ) as exists
          `;

          results[tableName].push({
            partitionName,
            exists: exists[0]?.exists ?? false,
          });
        } catch {
          results[tableName].push({ partitionName, exists: false });
        }
      }
    }

    return results;
  }
}
