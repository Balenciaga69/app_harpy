import type { User } from '../infra/domain/User'
export interface IUserRepository {
  findById(userId: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  save(user: User): Promise<void>
  getOrCreateAnonymous(userId: string): Promise<User>
}
