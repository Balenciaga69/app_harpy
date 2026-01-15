import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_KEYS } from '../auth.config'
import { IGuestRepository } from '../contracts'
import { GuestSession } from './guest-session.entity'
@Injectable()
export class RedisGuestRepository implements IGuestRepository {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  private getKey(guestId: string) {
    return `${REDIS_KEYS.GUEST_SESSION}:${guestId}`
  }
  private calcTtl(expiresAt: Date): number {
    return Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  }
  async save(session: GuestSession): Promise<void> {
    const key = this.getKey(session.guestId)
    const ttl = this.calcTtl(session.expiresAt)
    await this.redis.set(key, JSON.stringify(session), 'EX', ttl)
  }
  async findByGuestId(guestId: string): Promise<GuestSession | null> {
    const key = this.getKey(guestId)
    const data = await this.redis.get(key)
    return data ? (JSON.parse(data) as GuestSession) : null
  }
  async existsByGuestId(guestId: string): Promise<boolean> {
    const key = this.getKey(guestId)
    return (await this.redis.exists(key)) === 1
  }
  async deleteByGuestId(guestId: string): Promise<void> {
    const key = this.getKey(guestId)
    await this.redis.del(key)
  }
  async updateExpiresAt(guestId: string, expiresAt: Date): Promise<void> {
    const key = this.getKey(guestId)
    const ttl = this.calcTtl(expiresAt)
    await this.redis.expire(key, ttl)
  }
}
