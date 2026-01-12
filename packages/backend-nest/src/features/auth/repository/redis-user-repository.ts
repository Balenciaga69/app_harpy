import { Inject, Injectable } from '@nestjs/common'
import type Redis from 'ioredis'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { User } from '../model/user'
import type { IUserRepository } from './user-repository'
@Injectable()
export class RedisUserRepository implements IUserRepository {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  async findById(userId: string): Promise<User | null> {
    const data = await this.redis.get(`user:${userId}`)
    return data ? (JSON.parse(data) as User) : null
  }
  async findByUsername(username: string): Promise<User | null> {
    const userId = await this.redis.get(`username:${username}`)
    if (!userId) return null
    return this.findById(userId)
  }
  async save(user: User): Promise<void> {
    await this.redis.setex(`user:${user.userId}`, 86400 * 365, JSON.stringify(user))
    if (user.username) {
      await this.redis.setex(`username:${user.username}`, 86400 * 365, user.userId)
    }
  }
  async getOrCreateAnonymous(userId: string): Promise<User> {
    let user = await this.findById(userId)
    if (!user) {
      user = {
        userId,
        isAnonymous: true,
        createdAt: Date.now(),
      }
      await this.redis.setex(`user:${userId}`, 3600, JSON.stringify(user))
    }
    return user
  }
}
