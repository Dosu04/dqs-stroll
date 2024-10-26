import { IsInt, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  questionId: number; 

  @IsInt()
  cycleId: number; 

  @IsInt()
  regionId: number; 

  @IsDateString()
  assignedDate: Date; 
}
