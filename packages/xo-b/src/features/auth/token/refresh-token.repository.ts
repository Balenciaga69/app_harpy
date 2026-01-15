import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_KEYS } from '../auth.config'
import { IRefreshTokenRepository } from '../contracts'
import { RefreshTokenRecord } from './refresh-token-record.entity'
@Injectable()
export class RedisRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  private getRecordKey(jti: string) {
    return `${REDIS_KEYS.REFRESH_TOKEN_RECORD}:${jti}`
  }
  private getUserTokensKey(userId: string) {
    return `${REDIS_KEYS.USER_TOKENS}:${userId}`
  }
  private getBlacklistKey(jti: string) {
    return `${REDIS_KEYS.BLACKLIST}:${jti}`
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
      const ids = await this.redis.smembers(userTokensKey)
      if (ids.length === 0) {
        return
      }
      const pipeline = this.redis.pipeline()
      for (const jti of ids) {
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
