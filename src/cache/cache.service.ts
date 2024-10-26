import { Injectable } from '@nestjs/common';
import { Assignment } from '../assignments/entities/assignment.entity';
import { RedisService } from 'src/config/redis.config';

@Injectable()
export class CacheService {
  private readonly CACHE_PREFIX = 'assignment_';

  constructor(private readonly redisService: RedisService) {}

  /**
   * @param ttl - Time-to-Live in seconds (set to cycle duration).
   */
  async setAssignment(
    regionId: number,
    cycleId: number,
    assignment: Assignment,
    ttl: number,
  ): Promise<void> {
    const cacheKey = this.getCacheKey(regionId, cycleId);
    await this.redisService
      .getClient()
      .set(cacheKey, JSON.stringify(assignment), 'EX', ttl);
  }

  async getAssignment(
    regionId: number,
    cycleId: number,
  ): Promise<Assignment | null> {
    const cacheKey = this.getCacheKey(regionId, cycleId);
    const cachedData = await this.redisService.getClient().get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private getCacheKey(regionId: number, cycleId: number): string {
    return `${this.CACHE_PREFIX}${regionId}_${cycleId}`;
  }
}
