import { Controller, Post } from '@nestjs/common';
import { QuestionRotationJob } from './cron-jobs/question-rotation.job';

@Controller()
export class AppController {
  constructor(private readonly questionRotationJob: QuestionRotationJob) {}

  @Post('trigger-rotation')
  async triggerRotation() {
    await this.questionRotationJob.handleQuestionRotation();
    return { message: 'Question rotation triggered manually.' };
  }
}
