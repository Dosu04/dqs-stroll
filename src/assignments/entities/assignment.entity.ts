import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { Cycle } from '../../cycles/entities/cycle.entity';
import { Region } from '../../regions/entities/region.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, { eager: true })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Cycle, { eager: true })
  @JoinColumn({ name: 'cycle_id' })
  cycle: Cycle;

  @ManyToOne(() => Region, { eager: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'timestamptz' })
  assignedDate: Date; 
}
