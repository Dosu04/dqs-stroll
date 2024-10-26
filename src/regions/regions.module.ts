import { Module } from '@nestjs/common';
import { Region } from './entities/region.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Region])],
  providers: [RegionsService],
  controllers: [RegionsController],
  exports: [RegionsService, TypeOrmModule],
})
export class RegionsModule {}
