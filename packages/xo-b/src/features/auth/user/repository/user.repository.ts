import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'

import { UserDto } from '../../shared/user.dto'
import { User } from '../model/user.entity'
/** 用戶儲存庫介面 */
export interface IUserRepository {
  save(user: User): Promise<void>
  findByUsername(username: string): Promise<User | null>
  existsByUsername(username: string): Promise<boolean>
  findActiveByUsername(username: string): Promise<User | null>
}
@Injectable()
export class RedisUserRepository implements IUserRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  async save(user: User): Promise<void> {
    const key = `user:${user.username}`
    await this.cache.set(key, user)
  }
  async findByUsername(username: string): Promise<User | null> {
    const key = `user:${username}`
    const data = await this.cache.get<Record<string, unknown>>(key)
    if (!data) return null
    return plainToInstance(UserDto, data)
  }
  async existsByUsername(username: string): Promise<boolean> {
    const key = `user:${username}`
    return (await this.cache.get(key)) !== undefined
  }
  async findActiveByUsername(username: string): Promise<User | null> {
    const user = await this.findByUsername(username)
    return user && user.isActive ? user : null
  }
}
