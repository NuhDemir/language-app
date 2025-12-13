import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExercisesModule } from './exercises/exercises.module';
import { CoursesModule } from './courses/courses.module';
import { CronModule } from './cron/cron.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { LessonFlowModule } from './lesson-flow/lesson-flow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ExercisesModule,
    CoursesModule,
    CronModule,
    VocabularyModule,
    LessonFlowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

