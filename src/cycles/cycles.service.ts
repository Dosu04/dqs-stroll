import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cycle } from './entities/cycle.entity';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { CreateCycleDto } from './dto/create-cycle.dto';

@Injectable()
export class CyclesService {
  constructor(
    @InjectRepository(Cycle)
    private cyclesRepository: Repository<Cycle>,
  ) {}

  create(createCycleDto: CreateCycleDto): Promise<Cycle> {
    const cycle = this.cyclesRepository.create(createCycleDto);
    return this.cyclesRepository.save(cycle);
  }

  findAll(): Promise<Cycle[]> {
    return this.cyclesRepository.find();
  }

  async findOne(id: number): Promise<Cycle> {
    const cycle = await this.cyclesRepository.findOneBy({ id });
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${id} not found`);
    }
    return cycle;
  }

  async update(id: number, updateCycleDto: UpdateCycleDto): Promise<Cycle> {
    await this.cyclesRepository.update(id, updateCycleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cyclesRepository.delete(id);
  }

  async getActiveCycle(): Promise<Cycle | null> {
    const currentDate = new Date();

    const activeCycle = await this.cyclesRepository
      .createQueryBuilder('cycle')
      .where('cycle.startDate <= :currentDate', { currentDate })
      .andWhere(
        `cycle.startDate + INTERVAL '1 day' * cycle.durationInDays >= :currentDate`,
        { currentDate },
      )
      .andWhere('cycle.active = :active', { active: true })
      .orderBy('cycle.startDate', 'DESC')
      .getOne();

    if (!activeCycle) {
      throw new NotFoundException('No active cycle found');
    }

    return activeCycle;
  }
}
