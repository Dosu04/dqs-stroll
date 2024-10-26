import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AssignmentsService } from 'src/assignments/assignments.service';
import { CacheService } from 'src/cache/cache.service';
import { CyclesService } from 'src/cycles/cycles.service';
import { QuestionsService } from 'src/questions/questions.service';
import { RegionsService } from 'src/regions/regions.service';

@Injectable()
export class QuestionRotationJob {
  private readonly logger = new Logger(QuestionRotationJob.name);

  constructor(
    private readonly regionsService: RegionsService,
    private readonly cyclesService: CyclesService,
    private readonly questionsService: QuestionsService,
    private readonly assignmentsService: AssignmentsService,
    private readonly cacheService: CacheService,
  ) {}

  @Cron('0 19 * * 1', { timeZone: 'Asia/Singapore' })
  async handleQuestionRotation() {
    this.logger.log('Starting question rotation job');

    try {
      const regions = await this.regionsService.findAll();
      const activeCycle = await this.cyclesService.getActiveCycle();

      for (const region of regions) {
        const nextQuestion =
          await this.questionsService.getNextQuestionForRegion(
            region.id,
            activeCycle.id,
          );

        if (!nextQuestion) {
          this.logger.warn(`No next question found for region ${region.name}`);
          continue;
        }

        const assignment =
          await this.assignmentsService.createOrUpdateAssignment(
            region.id,
            activeCycle.id,
            nextQuestion.id,
          );

        const cycleDurationSeconds = activeCycle.durationInDays * 24 * 60 * 60;
        await this.cacheService.setAssignment(
          region.id,
          activeCycle.id,
          assignment,
          cycleDurationSeconds,
        );

        this.logger.log(
          `Assigned question ID ${nextQuestion.id} to region ${region.name} for cycle ${activeCycle.id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error occurred during question rotation job',
        error.stack,
      );
    }

    this.logger.log('Question rotation job completed');
  }

  
}
