import { Injectable, Inject } from '@nestjs/common'
import Redis from 'ioredis'
import { InjectionTokens } from '../shared/providers/injection-tokens'
/**
 * Token 暺??格???
 * ?冽摮撌脩?箇? token嚗甇Ｗ歇?餃?冽蝜潛?雿輻??token
 * Redis 銝凋誑 token digest 雿 key嚗TL ?芸?閮剔 token ????
 */
@Injectable()
export class TokenBlacklistService {
  private readonly keyPrefix = 'auth:blacklist:'
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  /**
   * 撠?token ?暺???
   * @param tokenDigest token ??皝?閬? jti嚗銝霅蝚佗?
   * @param expiresInSeconds token ??????
   */
  async addToBlacklist(tokenDigest: string, expiresInSeconds: number): Promise<void> {
    const key = this.keyPrefix + tokenDigest
    // 閮剔蔭 key嚗潛???喉?TTL 蝑 token ????
    await this.redis.setex(key, expiresInSeconds, new Date().toISOString())
  }
  /**
   * 瑼Ｘ token ?臬?券??銝?
   * @param tokenDigest token ??皝?閬? jti
   * @returns ?臬?券??銝?
   */
  async isTokenBlacklisted(tokenDigest: string): Promise<boolean> {
    const key = this.keyPrefix + tokenDigest
    const result = await this.redis.get(key)
    return result !== null
  }
  /**
   * 敺??銝剔宏??token嚗??砌??閬?TTL ?????
   * @param tokenDigest token ??皝?閬? jti
   */
  async removeFromBlacklist(tokenDigest: string): Promise<void> {
    const key = this.keyPrefix + tokenDigest
    await this.redis.del(key)
  }
}
