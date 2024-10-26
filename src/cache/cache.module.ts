import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisService } from 'src/config/redis.config';

@Module({
  providers: [CacheService, RedisService],
  exports: [CacheService, RedisService],
})
export class CacheModule {}
