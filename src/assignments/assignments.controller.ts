import { Controller, Get, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':regionId/:cycleId')
  getAssignment(
    @Param('regionId') regionId: number,
    @Param('cycleId') cycleId: number,
  ) {
    return this.assignmentsService.getAssignment(regionId, cycleId);
  }
}
