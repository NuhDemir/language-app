import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PartitionMaintenanceService } from './partition-maintenance.service';

/**
 * Cron Module for scheduled tasks.
 * Includes partition maintenance automation.
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PartitionMaintenanceService],
  exports: [PartitionMaintenanceService],
})
export class CronModule {}
