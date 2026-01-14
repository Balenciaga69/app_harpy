import { Injectable, Inject } from '@nestjs/common'
import Redis from 'ioredis'
import { InjectionTokens } from '../shared/providers/injection-tokens'
@Injectable()
export class TokenBlacklistService {
  private readonly keyPrefix = 'auth:blacklist:'
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  async addToBlacklist(tokenDigest: string, expiresInSeconds: number): Promise<void> {
    const key = this.keyPrefix + tokenDigest
    await this.redis.setex(key, expiresInSeconds, new Date().toISOString())
  }
  async isTokenBlacklisted(tokenDigest: string): Promise<boolean> {
    const key = this.keyPrefix + tokenDigest
    const result = await this.redis.get(key)
    return result !== null
  }
  async removeFromBlacklist(tokenDigest: string): Promise<void> {
    const key = this.keyPrefix + tokenDigest
    await this.redis.del(key)
  }
}
