import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Region } from 'src/regions/entities/region.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,

    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { regionId, ...questionData } = createQuestionDto;

    const region = await this.regionsRepository.findOne({
      where: { id: regionId },
    });
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }

    const question = this.questionsRepository.create({
      ...questionData,
      region,
    });

    return this.questionsRepository.save(question);
  }

  findAll(): Promise<Question[]> {
    return this.questionsRepository.find({ relations: ['region'] });
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['region'],
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const { regionId, ...updateData } = updateQuestionDto;

    const question = await this.questionsRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    if (regionId) {
      const region = await this.regionsRepository.findOne({
        where: { id: regionId },
      });
      if (!region) {
        throw new NotFoundException(`Region with ID ${regionId} not found`);
      }
      question.region = region;
    }

    Object.assign(question, updateData);

    return this.questionsRepository.save(question);
  }

  async remove(id: number): Promise<void> {
    const result = await this.questionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }

  async getNextQuestionForRegion(
    regionId: number,
    cycleId: number,
  ): Promise<Question | null> {
    const questions = await this.questionsRepository.find({
      where: { region: { id: regionId } },
      order: { id: 'ASC' },
      relations: ['region'],
    });

    if (!questions.length) {
      return null;
    }

    const nextQuestionIndex = cycleId % questions.length;
    return questions[nextQuestionIndex];
  }
}
