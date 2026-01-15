import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { RefreshTokenRecord } from '../model/refresh-token-record.entity'
export interface IRefreshTokenRepository {
  save(record: RefreshTokenRecord): Promise<void>
  findByJti(jti: string): Promise<RefreshTokenRecord | null>
  deleteByJti(jti: string): Promise<void>
  deleteAllByUserId(userId: string): Promise<void>
  isBlacklisted(jti: string): Promise<boolean>
  addToBlacklist(jti: string, expiresAt: Date): Promise<void>
}
@Injectable()
export class RedisRefreshTokenRepository implements IRefreshTokenRepository {
  //@Copilot Is there a reason why these PREFIXES are not put in auth.config.ts?
  // Or why are they needed? Can it still work without writing these?
  private readonly RECORD_PREFIX = 'refresh-token'
  private readonly USER_TOKENS_PREFIX = 'user-tokens'
  private readonly BLACKLIST_PREFIX = 'blacklist'
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  private getRecordKey(jti: string) {
    return `${this.RECORD_PREFIX}:${jti}`
  }
  private getUserTokensKey(userId: string) {
    return `${this.USER_TOKENS_PREFIX}:${userId}`
  }
  private getBlacklistKey(jti: string) {
    return `${this.BLACKLIST_PREFIX}:${jti}`
  }
  private validateExpiresAt(expiresAt: Date): number {
    const now = Date.now()
    const expiresMs = expiresAt.getTime()
    if (expiresMs <= now) {
      throw new Error(`Token has already expired: ${expiresAt.toISOString()}`)
    }
    return Math.floor((expiresMs - now) / 1000)
  }
  async save(record: RefreshTokenRecord): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(record.expiresAt)
      const recordKey = this.getRecordKey(record.jti)
      const userTokensKey = this.getUserTokensKey(record.userId)
      await this.redis
        .pipeline()
        .set(recordKey, JSON.stringify(record), 'EX', ttl)
        .sadd(userTokensKey, record.jti)
        .exec()
    } catch (error) {
      throw this.handleError('save', error)
    }
  }
  async findByJti(jti: string): Promise<RefreshTokenRecord | null> {
    try {
      const key = this.getRecordKey(jti)
      const data = await this.redis.get(key)
      return data ? (JSON.parse(data) as RefreshTokenRecord) : null
    } catch (error) {
      throw this.handleError('findByJti', error)
    }
  }
  async deleteByJti(jti: string): Promise<void> {
    try {
      const key = this.getRecordKey(jti)
      await this.redis.del(key)
    } catch (error) {
      throw this.handleError('deleteByJti', error)
    }
  }
  async deleteAllByUserId(userId: string): Promise<void> {
    try {
      const userTokensKey = this.getUserTokensKey(userId)
      const jtis = await this.redis.smembers(userTokensKey)
      if (jtis.length === 0) {
        return
      }
      const pipeline = this.redis.pipeline()
      for (const jti of jtis) {
        const recordKey = this.getRecordKey(jti)
        const blacklistKey = this.getBlacklistKey(jti)
        pipeline.del(recordKey)
        pipeline.del(blacklistKey)
      }
      pipeline.del(userTokensKey)
      await pipeline.exec()
    } catch (error) {
      throw this.handleError('deleteAllByUserId', error)
    }
  }
  async isBlacklisted(jti: string): Promise<boolean> {
    try {
      const key = this.getBlacklistKey(jti)
      return (await this.redis.exists(key)) === 1
    } catch (error) {
      throw this.handleError('isBlacklisted', error)
    }
  }
  async addToBlacklist(jti: string, expiresAt: Date): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(expiresAt)
      const key = this.getBlacklistKey(jti)
      await this.redis.set(key, '1', 'EX', ttl)
    } catch (error) {
      throw this.handleError('addToBlacklist', error)
    }
  }
  private handleError(method: string, error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error(`RefreshTokenRepository.${method} failed: ${String(error)}`)
  }
}
