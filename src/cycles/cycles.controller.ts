import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { CyclesService } from './cycles.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@Controller('cycles')
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Post()
  create(@Body() createCycleDto: CreateCycleDto) {
    return this.cyclesService.create(createCycleDto);
  }

  @Get()
  findAll() {
    return this.cyclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cyclesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCycleDto: UpdateCycleDto) {
    return this.cyclesService.update(id, updateCycleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.cyclesService.remove(id);
  }
}
