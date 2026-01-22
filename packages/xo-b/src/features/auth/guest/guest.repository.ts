import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'

import { REDIS_KEYS } from '../auth.config'
import { GuestSessionDto } from '../shared/guest-session.dto'
import { GuestSession } from './guest-session.entity'
/** 訪客 Session 儲存庫介面*/
export interface IGuestRepository {
  save(session: GuestSession): Promise<void>
  findByGuestId(guestId: string): Promise<GuestSession | null>
  existsByGuestId(guestId: string): Promise<boolean>
  deleteByGuestId(guestId: string): Promise<void>
  updateExpiresAt(guestId: string, expiresAt: Date): Promise<void>
}
@Injectable()
export class RedisGuestRepository implements IGuestRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  private getKey(guestId: string) {
    return `${REDIS_KEYS.GUEST_SESSION}:${guestId}`
  }
  private calcTtl(expiresAt: Date): number {
    return Math.max(1, expiresAt.getTime() - Date.now())
  }
  async save(session: GuestSession): Promise<void> {
    const key = this.getKey(session.guestId)
    const ttl = this.calcTtl(session.expiresAt)
    await this.cache.set(key, session, ttl)
  }
  async findByGuestId(guestId: string): Promise<GuestSession | null> {
    const key = this.getKey(guestId)
    const data = await this.cache.get<Record<string, unknown>>(key)
    if (!data) return null
    return plainToInstance(GuestSessionDto, data)
  }
  async existsByGuestId(guestId: string): Promise<boolean> {
    const key = this.getKey(guestId)
    return (await this.cache.get(key)) !== undefined
  }
  async deleteByGuestId(guestId: string): Promise<void> {
    const key = this.getKey(guestId)
    await this.cache.del(key)
  }
  async updateExpiresAt(guestId: string, expiresAt: Date): Promise<void> {
    const session = await this.findByGuestId(guestId)
    if (session) {
      session.expiresAt = expiresAt
      await this.save(session)
    }
  }
}
