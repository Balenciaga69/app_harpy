import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_KEYS } from '../auth.config'
import { IAccessTokenRepository } from '../contracts'
import { AccessTokenRecord } from './access-token-record.entity'

@Injectable()
export class RedisAccessTokenRepository implements IAccessTokenRepository {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  private getRecordKey(jti: string) {
    return `${REDIS_KEYS.ACCESS_TOKEN}:${jti}`
  }
  private getUserDevicesKey(userId: string) {
    return `${REDIS_KEYS.USER_DEVICES}:${userId}`
  }
  private getDeviceBlacklistKey(userId: string, deviceId: string) {
    return `${REDIS_KEYS.ACCESS_TOKEN_BLACKLIST}:${userId}:device:${deviceId}`
  }
  private getJtiBlacklistKey(jti: string) {
    return `${REDIS_KEYS.ACCESS_TOKEN_BLACKLIST}:${jti}`
  }
  private getUserAllDevicesBlacklistKey(userId: string) {
    return `${REDIS_KEYS.ACCESS_TOKEN_BLACKLIST}:${userId}:all-devices`
  }
  private validateExpiresAt(expiresAt: Date): number {
    const now = Date.now()
    const expiresMs = expiresAt.getTime()
    if (expiresMs <= now) {
      throw new Error(`Token has already expired: ${expiresAt.toISOString()}`)
    }
    return Math.floor((expiresMs - now) / 1000)
  }
  async save(record: AccessTokenRecord): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(record.expiresAt)
      const recordKey = this.getRecordKey(record.jti)
      const userDevicesKey = this.getUserDevicesKey(record.userId)
      await this.redis
        .pipeline()
        .set(recordKey, JSON.stringify(record), 'EX', ttl)
        .sadd(userDevicesKey, record.deviceId)
        .exec()
    } catch (error) {
      throw this.handleError('save', error)
    }
  }
  async findByJti(jti: string): Promise<AccessTokenRecord | null> {
    try {
      const key = this.getRecordKey(jti)
      const data = await this.redis.get(key)
      return data ? (JSON.parse(data) as AccessTokenRecord) : null
    } catch (error) {
      throw this.handleError('findByJti', error)
    }
  }
  async isBlacklistedByJti(jti: string): Promise<boolean> {
    try {
      const key = this.getJtiBlacklistKey(jti)
      return (await this.redis.exists(key)) === 1
    } catch (error) {
      throw this.handleError('isBlacklistedByJti', error)
    }
  }
  async isBlacklistedByDeviceId(userId: string, deviceId: string): Promise<boolean> {
    try {
      // 檢查該裝置是否被黑名單
      const deviceBlacklistKey = this.getDeviceBlacklistKey(userId, deviceId)
      const deviceBlacklisted = (await this.redis.exists(deviceBlacklistKey)) === 1
      if (deviceBlacklisted) {
        return true
      }
      // 檢查用戶是否登出所有裝置
      const allDevicesBlacklistKey = this.getUserAllDevicesBlacklistKey(userId)
      const allDevicesBlacklisted = (await this.redis.exists(allDevicesBlacklistKey)) === 1
      return allDevicesBlacklisted
    } catch (error) {
      throw this.handleError('isBlacklistedByDeviceId', error)
    }
  }
  async addToBlacklist(jti: string, expiresAt: Date): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(expiresAt)
      const key = this.getJtiBlacklistKey(jti)
      await this.redis.set(key, '1', 'EX', ttl)
    } catch (error) {
      throw this.handleError('addToBlacklist', error)
    }
  }
  async addDeviceToBlacklist(userId: string, deviceId: string, expiresAt: Date): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(expiresAt)
      const key = this.getDeviceBlacklistKey(userId, deviceId)
      await this.redis.set(key, '1', 'EX', ttl)
    } catch (error) {
      throw this.handleError('addDeviceToBlacklist', error)
    }
  }
  async addAllDevicesToBlacklist(userId: string): Promise<void> {
    try {
      const key = this.getUserAllDevicesBlacklistKey(userId)
      // 永久黑名單，需要等待用戶重新登入時清除，或者設置一個很長的 TTL
      // 這裡設置 30 天 TTL，確保不會因為 Redis 故障導致資料泄露
      const ttl = 30 * 24 * 60 * 60
      await this.redis.set(key, '1', 'EX', ttl)
    } catch (error) {
      throw this.handleError('addAllDevicesToBlacklist', error)
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
      const userDevicesKey = this.getUserDevicesKey(userId)
      const devices = await this.redis.smembers(userDevicesKey)
      if (devices.length === 0) {
        return
      }
      const pipeline = this.redis.pipeline()
      // 刪除每個裝置的黑名單記錄
      for (const deviceId of devices) {
        const deviceBlacklistKey = this.getDeviceBlacklistKey(userId, deviceId)
        pipeline.del(deviceBlacklistKey)
      }
      // 刪除用戶裝置列表
      pipeline.del(userDevicesKey)
      // 刪除用戶全裝置黑名單
      const allDevicesBlacklistKey = this.getUserAllDevicesBlacklistKey(userId)
      pipeline.del(allDevicesBlacklistKey)
      await pipeline.exec()
    } catch (error) {
      throw this.handleError('deleteAllByUserId', error)
    }
  }
  private handleError(method: string, error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error(`RedisAccessTokenRepository.${method} failed: ${String(error)}`)
  }
}
