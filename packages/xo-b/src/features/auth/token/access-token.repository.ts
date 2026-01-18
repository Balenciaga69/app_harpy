import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { JWT_CONFIG, REDIS_KEYS } from '../auth.config'
import { IAccessTokenRepository } from '../contracts'
import { AccessTokenRecordDto } from '../shared/access-token-record.dto'
import { AccessTokenRecord } from './access-token-record.entity'
@Injectable()
export class RedisAccessTokenRepository implements IAccessTokenRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
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
    return expiresMs - now
  }
  async save(record: AccessTokenRecord): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(record.expiresAt)
      const recordKey = this.getRecordKey(record.jti)
      const userDevicesKey = this.getUserDevicesKey(record.userId)
      await this.cache.set(recordKey, record, ttl)
      // 記錄用戶的裝置列表（這裡簡化，實際可能需要 Set 結構）
      const devices = await this.cache.get<string[]>(userDevicesKey)
      const updatedDevices = devices ? [...new Set([...devices, record.deviceId])] : [record.deviceId]
      await this.cache.set(userDevicesKey, updatedDevices, ttl)
    } catch (error) {
      throw this.handleError('save', error)
    }
  }
  async findByJti(jti: string): Promise<AccessTokenRecord | null> {
    try {
      const key = this.getRecordKey(jti)
      const data = await this.cache.get<Record<string, unknown>>(key)
      if (!data) return null
      return plainToInstance(AccessTokenRecordDto, data)
    } catch (error) {
      throw this.handleError('findByJti', error)
    }
  }
  async isBlacklistedByJti(jti: string): Promise<boolean> {
    try {
      const key = this.getJtiBlacklistKey(jti)
      return (await this.cache.get(key)) !== undefined
    } catch (error) {
      throw this.handleError('isBlacklistedByJti', error)
    }
  }
  async isBlacklistedByDeviceId(userId: string, deviceId: string): Promise<boolean> {
    try {
      const deviceBlacklistKey = this.getDeviceBlacklistKey(userId, deviceId)
      const deviceBlacklisted = (await this.cache.get(deviceBlacklistKey)) !== undefined
      if (deviceBlacklisted) {
        return true
      }
      const allDevicesBlacklistKey = this.getUserAllDevicesBlacklistKey(userId)
      const allDevicesBlacklisted = (await this.cache.get(allDevicesBlacklistKey)) !== undefined
      return allDevicesBlacklisted
    } catch (error) {
      throw this.handleError('isBlacklistedByDeviceId', error)
    }
  }
  async addToBlacklist(jti: string, expiresAt: Date): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(expiresAt)
      const key = this.getJtiBlacklistKey(jti)
      await this.cache.set(key, '1', ttl)
    } catch (error) {
      throw this.handleError('addToBlacklist', error)
    }
  }
  async addDeviceToBlacklist(userId: string, deviceId: string, expiresAt: Date): Promise<void> {
    try {
      const ttl = this.validateExpiresAt(expiresAt)
      const key = this.getDeviceBlacklistKey(userId, deviceId)
      await this.cache.set(key, '1', ttl)
    } catch (error) {
      throw this.handleError('addDeviceToBlacklist', error)
    }
  }
  async addAllDevicesToBlacklist(userId: string): Promise<void> {
    try {
      const key = this.getUserAllDevicesBlacklistKey(userId)
      const ttl = JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS * 1000
      await this.cache.set(key, '1', ttl)
    } catch (error) {
      throw this.handleError('addAllDevicesToBlacklist', error)
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
      const userDevicesKey = this.getUserDevicesKey(userId)
      const devices = await this.cache.get<string[]>(userDevicesKey)
      if (!devices || devices.length === 0) {
        return
      }
      for (const deviceId of devices) {
        const deviceBlacklistKey = this.getDeviceBlacklistKey(userId, deviceId)
        await this.cache.del(deviceBlacklistKey)
      }
      await this.cache.del(userDevicesKey)
      const allDevicesBlacklistKey = this.getUserAllDevicesBlacklistKey(userId)
      await this.cache.del(allDevicesBlacklistKey)
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
