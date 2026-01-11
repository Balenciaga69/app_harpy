/* eslint-disable @typescript-eslint/unbound-method */
import { AuthService } from './app/auth.service'
import type { IUserRepository } from './app/IUserRepository'
import { JwtTokenProvider } from './infra/jwt.token.provider'
import type { User } from './infra/domain/User'
import { BadRequestException } from '@nestjs/common'
describe('AuthService - Simple Unit Tests', () => {
  let service: AuthService
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockTokenProvider: jest.Mocked<JwtTokenProvider>
  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn(),
      getOrCreateAnonymous: jest.fn(),
    }
    mockTokenProvider = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtTokenProvider>
    service = new AuthService(mockUserRepository, mockTokenProvider)
  })
  describe('createAnonymousSession', () => {
    it('should create anonymous user and return token', async () => {
      const mockUser: User = {
        userId: 'generated-uuid',
        isAnonymous: true,
        createdAt: Date.now(),
      }
      mockUserRepository.getOrCreateAnonymous.mockResolvedValue(mockUser)
      mockTokenProvider.sign.mockReturnValue('mock-token-123')
      const result = await service.createAnonymousSession()
      expect(result.token).toBe('mock-token-123')
      expect(mockUserRepository.getOrCreateAnonymous).toHaveBeenCalled()
      expect(mockTokenProvider.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          is_anon: true,
          ver: 1,
        })
      )
    })
  })
  describe('login', () => {
    it('should login existing user with correct password', async () => {
      const mockUser: User = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }
      mockUserRepository.findByUsername.mockResolvedValue(mockUser)
      mockTokenProvider.sign.mockReturnValue('mock-token')
      const result = await service.login('testuser', '12345')
      expect(result.accessToken).toBe('mock-token')
      expect(result.refreshToken).toBe('mock-token')
      expect(mockTokenProvider.sign).toHaveBeenCalledTimes(2)
    })
    it('should create new user if not exists', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null)
      mockUserRepository.save.mockResolvedValue(undefined)
      mockTokenProvider.sign.mockReturnValue('mock-token')
      const result = await service.login('newuser', '12345')
      expect(result.accessToken).toBe('mock-token')
      expect(mockUserRepository.save).toHaveBeenCalled()
    })
    it('should throw error on wrong password', async () => {
      await expect(service.login('testuser', 'wrongpass')).rejects.toThrow(BadRequestException)
    })
  })
  describe('refreshAccessToken', () => {
    it('should return new access token from valid refresh token', () => {
      const mockPayload = {
        sub: 'user-123',
        is_anon: false,
        ver: 1,
      }
      mockTokenProvider.verify.mockReturnValue(mockPayload)
      mockTokenProvider.sign.mockReturnValue('new-access-token')
      const result = service.refreshAccessToken('valid-refresh-token')
      expect(result).toBe('new-access-token')
      expect(mockTokenProvider.verify).toHaveBeenCalledWith('valid-refresh-token')
    })
    it('should throw error on invalid refresh token', () => {
      mockTokenProvider.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })
      expect(() => service.refreshAccessToken('invalid-token')).toThrow(BadRequestException)
    })
  })
  describe('upgradeAnonymousToAuthenticated', () => {
    it('should upgrade anonymous user to authenticated', async () => {
      const anonUser: User = {
        userId: 'anon-123',
        isAnonymous: true,
        createdAt: Date.now(),
      }
      mockUserRepository.findById.mockResolvedValue(anonUser)
      mockUserRepository.findByUsername.mockResolvedValue(null)
      mockUserRepository.save.mockResolvedValue(undefined)
      mockTokenProvider.sign.mockReturnValue('mock-token')
      const result = await service.upgradeAnonymousToAuthenticated('anon-123', 'newuser')
      expect(result.accessToken).toBe('mock-token')
      expect(mockUserRepository.save).toHaveBeenCalled()
    })
    it('should throw error if user is not anonymous', async () => {
      const authenticatedUser: User = {
        userId: 'user-123',
        username: 'existing',
        isAnonymous: false,
        createdAt: Date.now(),
      }
      mockUserRepository.findById.mockResolvedValue(authenticatedUser)
      await expect(service.upgradeAnonymousToAuthenticated('user-123', 'newuser')).rejects.toThrow(BadRequestException)
    })
    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)
      await expect(service.upgradeAnonymousToAuthenticated('nonexistent', 'newuser')).rejects.toThrow(
        BadRequestException
      )
    })
  })
})
