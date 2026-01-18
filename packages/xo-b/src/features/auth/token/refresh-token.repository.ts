import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { REDIS_KEYS } from '../auth.config'
import { RefreshTokenRecordDto } from '../shared/refresh-token-record.dto'
import { RefreshTokenRecord } from './refresh-token-record.entity'
/** Refresh Token 儲存庫介面*/
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
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
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
    return expiresMs - now
  }
  async save(record: RefreshTokenRecord): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(record.expiresAt)
      const recordKey = this.getRecordKey(record.jti)
      const userTokensKey = this.getUserTokensKey(record.userId)
      await this.cache.set(recordKey, record, ttl)
      const tokens = await this.cache.get<string[]>(userTokensKey)
      const updatedTokens = tokens ? [...new Set([...tokens, record.jti])] : [record.jti]
      await this.cache.set(userTokensKey, updatedTokens, ttl)
    } catch (error) {
      throw this.handleError('save', error)
    }
  }
  async findByJti(jti: string): Promise<RefreshTokenRecord | null> {
    try {
      const key = this.getRecordKey(jti)
      const data = await this.cache.get<Record<string, unknown>>(key)
      if (!data) return null
      return plainToInstance(RefreshTokenRecordDto, data)
    } catch (error) {
      throw this.handleError('findByJti', error)
    }
  }
  async deleteByJti(jti: string): Promise<void> {
    try {
      const key = this.getRecordKey(jti)
      await this.cache.del(key)
    } catch (error) {
      throw this.handleError('deleteByJti', error)
    }
  }
  async deleteAllByUserId(userId: string): Promise<void> {
    try {
      const userTokensKey = this.getUserTokensKey(userId)
      const ids = await this.cache.get<string[]>(userTokensKey)
      if (!ids || ids.length === 0) {
        return
      }
      for (const jti of ids) {
        const recordKey = this.getRecordKey(jti)
        const blacklistKey = this.getBlacklistKey(jti)
        await this.cache.del(recordKey)
        await this.cache.del(blacklistKey)
      }
      await this.cache.del(userTokensKey)
    } catch (error) {
      throw this.handleError('deleteAllByUserId', error)
    }
  }
  async isBlacklisted(jti: string): Promise<boolean> {
    try {
      const key = this.getBlacklistKey(jti)
      return (await this.cache.get(key)) !== undefined
    } catch (error) {
      throw this.handleError('isBlacklisted', error)
    }
  }
  async addToBlacklist(jti: string, expiresAt: Date): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(expiresAt)
      const key = this.getBlacklistKey(jti)
      await this.cache.set(key, '1', ttl)
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
