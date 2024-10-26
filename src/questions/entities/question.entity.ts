import { Region } from 'src/regions/entities/region.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Region, (region) => region.questions)
  @JoinColumn({ name: 'region_id' }) 
  region: Region;
}
