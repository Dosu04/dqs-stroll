import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get('REDIS_HOST'),
      port: +configService.get('REDIS_PORT'),
    });
  }

  getClient(): Redis {
    return this.redis;
  }
}
