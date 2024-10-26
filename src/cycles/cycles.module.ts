import { Module } from '@nestjs/common';
import { Cycle } from './entities/cycle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cycle])],
  controllers: [CyclesController],
  providers: [CyclesService],
  exports: [CyclesService], 
})
export class CyclesModule {}
