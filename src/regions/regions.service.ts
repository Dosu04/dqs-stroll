import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) {}

  create(createRegionDto: CreateRegionDto): Promise<Region> {
    const region = this.regionsRepository.create(createRegionDto);
    return this.regionsRepository.save(region);
  }

  findAll(): Promise<Region[]> {
    return this.regionsRepository.find();
  }

  async findOne(id: number): Promise<Region> {
    const region = await this.regionsRepository.findOneBy({ id });
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
    await this.regionsRepository.update(id, updateRegionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.regionsRepository.delete(id);
  }
}
