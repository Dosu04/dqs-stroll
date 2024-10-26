import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './config/redis.config';
import { databaseConfig } from './config/database.config';
import { QuestionsModule } from './questions/questions.module';
import { CyclesModule } from './cycles/cycles.module';
import { RegionsModule } from './regions/regions.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CacheModule } from './cache/cache.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QuestionRotationJob } from './cron-jobs/question-rotation.job';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    QuestionsModule,
    CyclesModule,
    RegionsModule,
    AssignmentsModule,
    CacheModule,
    ScheduleModule.forRoot(),
  ],
  providers: [RedisService, QuestionRotationJob],
  exports: [RedisService],
  controllers: [AppController],
})
export class AppModule {}
