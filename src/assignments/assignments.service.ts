import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { RedisService } from 'src/config/redis.config';
import { Question } from 'src/questions/entities/question.entity';
import { Region } from 'src/regions/entities/region.entity';
import { Cycle } from 'src/cycles/entities/cycle.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    private redisService: RedisService,
  ) {}

  async getAssignment(regionId: number, cycleId: number): Promise<Assignment> {
    const cacheKey = `assignment_${regionId}_${cycleId}`;
    const cachedAssignment = await this.redisService.getClient().get(cacheKey);

    if (cachedAssignment) {
      return JSON.parse(cachedAssignment);
    }

    const assignment = await this.assignmentsRepository.findOne({
      where: { region: { id: regionId }, cycle: { id: cycleId } },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment not found for Region ID ${regionId} and Cycle ID ${cycleId}`,
      );
    }

    await this.redisService
      .getClient()
      .set(cacheKey, JSON.stringify(assignment), 'EX', 60 * 60 * 24 * 7); // 7 days
    return assignment;
  }

  async createOrUpdateAssignment(
    regionId: number,
    cycleId: number,
    questionId: number,
  ): Promise<Assignment> {
    let assignment = await this.assignmentsRepository.findOne({
      where: { region: { id: regionId }, cycle: { id: cycleId } },
    });

    if (assignment) {
      assignment.question = { id: questionId } as Question;
    } else {
      assignment = this.assignmentsRepository.create({
        region: { id: regionId } as Region,
        cycle: { id: cycleId } as Cycle,
        question: { id: questionId } as Question,
        assignedDate: new Date(),
      });
    }

    return this.assignmentsRepository.save(assignment);
  }
}
