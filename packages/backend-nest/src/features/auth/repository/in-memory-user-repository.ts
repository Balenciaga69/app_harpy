import { Injectable } from '@nestjs/common'
import type { User } from '../model/user'
import type { IUserRepository } from './user-repository'
@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, { user: User; expiresAt: number }>()
  private usernameLookup = new Map<string, string>()
  async findById(userId: string): Promise<User | null> {
    const entry = this.users.get(userId)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.users.delete(userId)
      return null
    }
    return Promise.resolve(entry.user)
  }
  async findByUsername(username: string): Promise<User | null> {
    const userId = this.usernameLookup.get(username)
    if (!userId) return null
    return this.findById(userId)
  }
  async save(user: User): Promise<void> {
    const expiresAt = Date.now() + 86400 * 365 * 1000
    this.users.set(user.userId, { user, expiresAt })
    if (user.username) {
      this.usernameLookup.set(user.username, user.userId)
    }
    return Promise.resolve()
  }
  async getOrCreateAnonymous(userId: string): Promise<User> {
    let user = await this.findById(userId)
    if (!user) {
      user = {
        userId,
        isAnonymous: true,
        createdAt: Date.now(),
      }
      await this.save(user)
    }
    return user
  }
}
