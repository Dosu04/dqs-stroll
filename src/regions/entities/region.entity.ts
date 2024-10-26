import { Question } from 'src/questions/entities/question.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  timezone: string;

  @OneToMany(() => Question, (question) => question.region)
  questions: Question[];
}
