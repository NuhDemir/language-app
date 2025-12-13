import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Partition Maintenance Service
 * Automatically creates monthly partitions for lesson_completions table.
 */
@Injectable()
export class PartitionMaintenanceService {
  private readonly logger = new Logger(PartitionMaintenanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates partition for the next month.
   * Runs on the 15th of every month at midnight.
   * This ensures the partition exists well before it's needed.
   */
  @Cron('0 0 15 * *')
  async createNextMonthPartition() {
    // Calculate next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');

    // Calculate the month after next (for TO boundary)
    const nextNextMonth = new Date(nextMonth);
    nextNextMonth.setMonth(nextNextMonth.getMonth() + 1);

    const endYear = nextNextMonth.getFullYear();
    const endMonth = String(nextNextMonth.getMonth() + 1).padStart(2, '0');

    const startStr = `${year}-${month}-01 00:00:00+00`;
    const endStr = `${endYear}-${endMonth}-01 00:00:00+00`;
    const tableName = `lesson_completions_y${year}m${month}`;

    this.logger.log(
      `Ensuring partition: ${tableName} for range [${startStr}, ${endStr})`,
    );

    try {
      // Use IF NOT EXISTS for idempotency
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${tableName}" 
        PARTITION OF "lesson_completions"
        FOR VALUES FROM ('${startStr}') TO ('${endStr}');
      `);
      this.logger.log(`Partition ${tableName} ensured successfully.`);
    } catch (error) {
      this.logger.error(`Failed to create partition ${tableName}`, error);
      // In production: send alert to admin via Slack/Email
    }
  }

  /**
   * Manual method to create a partition for a specific month.
   * Useful for backfilling or manual intervention.
   */
  async createPartitionForMonth(year: number, month: number) {
    const monthStr = String(month).padStart(2, '0');
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthStr = String(nextMonth).padStart(2, '0');

    const startStr = `${year}-${monthStr}-01 00:00:00+00`;
    const endStr = `${nextYear}-${nextMonthStr}-01 00:00:00+00`;
    const tableName = `lesson_completions_y${year}m${monthStr}`;

    this.logger.log(`Creating partition: ${tableName}`);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${tableName}" 
      PARTITION OF "lesson_completions"
      FOR VALUES FROM ('${startStr}') TO ('${endStr}');
    `);

    return { tableName, range: { from: startStr, to: endStr } };
  }
}
