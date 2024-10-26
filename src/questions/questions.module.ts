import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionRotationJob } from 'src/cron-jobs/question-rotation.job';
import { RegionsModule } from 'src/regions/regions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), RegionsModule],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}
