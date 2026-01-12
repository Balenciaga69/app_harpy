import type { User } from '../model/user'
import { InMemoryUserRepository } from '../repository/in-memory-user-repository'

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository

  beforeEach(() => {
    repository = new InMemoryUserRepository()
  })

  describe('save and findById', () => {
    it('should save user and retrieve by id', async () => {
      const user: User = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await repository.save(user)
      const found = await repository.findById('user-123')

      expect(found).toEqual(user)
    })

    it('should return null when user not found', async () => {
      const found = await repository.findById('nonexistent')

      expect(found).toBeNull()
    })

    it('should update existing user', async () => {
      const user: User = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await repository.save(user)

      const updatedUser: User = {
        ...user,
        username: 'updateduser',
      }

      await repository.save(updatedUser)
      const found = await repository.findById('user-123')

      expect(found?.username).toBe('updateduser')
    })
  })

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const user: User = {
        userId: 'user-456',
        username: 'john',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await repository.save(user)
      const found = await repository.findByUsername('john')

      expect(found).toEqual(user)
    })

    it('should return null when username not found', async () => {
      const found = await repository.findByUsername('nonexistent')

      expect(found).toBeNull()
    })

    it('should return null for anonymous user without username', async () => {
      const anonUser: User = {
        userId: 'anon-123',
        isAnonymous: true,
        createdAt: Date.now(),
      }

      await repository.save(anonUser)
      const found = await repository.findByUsername('john')

      expect(found).toBeNull()
    })
  })

  describe('getOrCreateAnonymous', () => {
    it('should create anonymous user if not exists', async () => {
      const result = await repository.getOrCreateAnonymous('anon-uuid-123')

      expect(result.userId).toBe('anon-uuid-123')
      expect(result.isAnonymous).toBe(true)
      expect(result.createdAt).toBeDefined()
    })

    it('should return existing anonymous user', async () => {
      const first = await repository.getOrCreateAnonymous('anon-uuid-456')
      const second = await repository.getOrCreateAnonymous('anon-uuid-456')

      expect(first.userId).toBe(second.userId)
      expect(first.createdAt).toBe(second.createdAt)
    })

    it('should not overwrite existing authenticated user', async () => {
      const authenticatedUser: User = {
        userId: 'user-789',
        username: 'john',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await repository.save(authenticatedUser)
      const result = await repository.getOrCreateAnonymous('user-789')

      expect(result.username).toBe('john')
      expect(result.isAnonymous).toBe(false)
    })
  })

  describe('expiration', () => {
    it('should expire user data after expiration time', async () => {
      const expiredUserId = 'user-exp-123'
      const testRepository = new InMemoryUserRepository()

      const user: User = {
        userId: expiredUserId,
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await testRepository.save(user)

      const before = await testRepository.findById(expiredUserId)
      expect(before).toBeTruthy()

      jest.useFakeTimers()
      jest.advanceTimersByTime(86400 * 365 * 1000 + 1000)

      const after = await testRepository.findById(expiredUserId)
      expect(after).toBeNull()

      jest.useRealTimers()
    })
  })

  describe('multiple users', () => {
    it('should handle multiple users', async () => {
      const user1: User = {
        userId: 'user-1',
        username: 'alice',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      const user2: User = {
        userId: 'user-2',
        username: 'bob',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await repository.save(user1)
      await repository.save(user2)

      const found1 = await repository.findByUsername('alice')
      const found2 = await repository.findByUsername('bob')

      expect(found1?.userId).toBe('user-1')
      expect(found2?.userId).toBe('user-2')
    })

    it('should maintain username index correctly', async () => {
      const user: User = {
        userId: 'user-123',
        username: 'unique-user',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      await repository.save(user)

      const found1 = await repository.findByUsername('unique-user')
      const found2 = await repository.findById('user-123')

      expect(found1).toEqual(found2)
    })
  })
})
