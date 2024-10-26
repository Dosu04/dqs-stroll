import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    private cacheService: CacheService,
  ) {}

  async getAssignment(regionId: number, cycleId: number, cycleDuration: number): Promise<Assignment> {
    const cachedAssignment = await this.cacheService.getAssignment(regionId, cycleId);

    if (cachedAssignment) {
      return cachedAssignment;
    }

    const assignment = await this.assignmentsRepository.findOne({
      where: { region: { id: regionId }, cycle: { id: cycleId } },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment not found for Region ID ${regionId} and Cycle ID ${cycleId}`);
    }

    await this.cacheService.setAssignment(regionId, cycleId, assignment, cycleDuration);
    return assignment;
  }
}
