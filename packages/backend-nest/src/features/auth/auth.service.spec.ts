/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { AuthService } from './app/auth.service'
import type { IUserRepository } from './app/user-repository'
import type { User } from './infra/domain/user'
import { JwtTokenProvider } from './infra/jwt-token-provider'
describe('AuthService', () => {
  let service: AuthService
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockTokenProvider: jest.Mocked<JwtTokenProvider>
  beforeEach(async () => {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: InjectionTokens.UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtTokenProvider,
          useValue: mockTokenProvider,
        },
      ],
    }).compile()
    service = module.get<AuthService>(AuthService)
  })
  describe('createAnonymousSession', () => {
    it('should create anonymous user and return token', async () => {
      const mockUser: User = {
        userId: 'anon-123',
        isAnonymous: true,
        createdAt: Date.now(),
      }
      mockUserRepository.getOrCreateAnonymous.mockResolvedValue(mockUser)
      mockTokenProvider.sign.mockReturnValue('mock-token-123')
      const result = await service.createAnonymousSession()
      expect(result.token).toBe('mock-token-123')
      expect(result.userId).toBe('anon-123')
      expect(mockTokenProvider.sign).toHaveBeenCalledWith({
        sub: 'anon-123',
        is_anon: true,
        ver: 1,
      })
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
