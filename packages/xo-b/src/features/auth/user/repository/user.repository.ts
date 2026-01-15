import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { User } from '../model/user.entity'
interface IUserRepository {
  save(user: User): Promise<void>
  findByUsername(username: string): Promise<User | null>
  existsByUsername(username: string): Promise<boolean>
  findActiveByUsername(username: string): Promise<User | null>
}
@Injectable()
export class RedisUserRepository implements IUserRepository {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  async save(user: User): Promise<void> {
    const key = `user:${user.username}`
    await this.redis.set(key, JSON.stringify(user))
  }
  async findByUsername(username: string): Promise<User | null> {
    const key = `user:${username}`
    const userData = await this.redis.get(key)
    return userData ? (JSON.parse(userData) as User) : null
  }
  async existsByUsername(username: string): Promise<boolean> {
    const key = `user:${username}`
    const exists = await this.redis.exists(key)
    return exists === 1
  }
  async findActiveByUsername(username: string): Promise<User | null> {
    const user = await this.findByUsername(username)
    return user && user.isActive ? user : null
  }
}
