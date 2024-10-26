import { IsInt, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCycleDto {
  @IsDateString()
  startDate: Date; 

  @IsInt()
  durationInDays: number; 

  @IsBoolean()
  @IsOptional()
  active?: boolean; 
}
