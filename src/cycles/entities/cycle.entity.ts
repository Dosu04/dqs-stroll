import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cycles')
export class Cycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz' })
  startDate: Date; 

  @Column({ type: 'int' })
  durationInDays: number; 

  @Column({ type: 'boolean', default: true })
  active: boolean; 
}