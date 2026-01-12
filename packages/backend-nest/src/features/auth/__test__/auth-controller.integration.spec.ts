/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import type { Response } from 'express'
import { InjectionTokens } from '../../shared/providers/injection-tokens'
import { AuthController } from '../auth.controller'
import { IsAuthenticatedGuard } from '../auth.guard'
import { AuthService } from '../auth.service'
import { JwtTokenProvider } from '../jwt-token-provider'
import { JwtStrategy } from '../jwt.strategy'
import type { IUserRepository } from '../repository/user-repository'

describe('AuthController Integration Tests', () => {
  let controller: AuthController
  let authService: AuthService
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockConfigService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn(),
      getOrCreateAnonymous: jest.fn(),
    }

    mockConfigService = {
      get: jest.fn(((key: string, defaultValue?: unknown) => {
        if (key === 'JWT_SECRET') return 'test-secret'
        if (key === 'NODE_ENV') return 'test'
        return defaultValue
      }) as unknown as ConfigService['get']),
    } as unknown as jest.Mocked<ConfigService>

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtTokenProvider,
        JwtStrategy,
        IsAuthenticatedGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: InjectionTokens.UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  describe('POST /api/auth/guest', () => {
    it('should create anonymous session and return token and userId', async () => {
      const mockUser = {
        userId: 'anon-uuid-123',
        isAnonymous: true,
        createdAt: Date.now(),
      }

      mockUserRepository.getOrCreateAnonymous.mockResolvedValue(mockUser)

      const result = await controller.createGuest()

      expect(result.success).toBe(true)
      expect(result.data.userId).toBe('anon-uuid-123')
      expect(result.data.accessToken).toBeTruthy()
      expect(typeof result.data.accessToken).toBe('string')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login existing user with correct password', async () => {
      const mockUser = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      mockUserRepository.findByUsername.mockResolvedValue(mockUser)

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      const result = await controller.login({ username: 'testuser', password: '12345' }, mockResponse)

      expect(result.success).toBe(true)
      expect(result.data.accessToken).toBeTruthy()
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object))
    })

    it('should create new user if username does not exist', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null)
      mockUserRepository.save.mockResolvedValue(undefined)

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      const result = await controller.login({ username: 'newuser', password: '12345' }, mockResponse)

      expect(result.success).toBe(true)
      expect(mockUserRepository.save).toHaveBeenCalled()
    })

    it('should reject login with wrong password', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      const promise = controller.login({ username: 'testuser', password: 'wrongpass' }, mockResponse)

      await expect(promise).rejects.toThrow(BadRequestException)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', () => {
      const mockValidToken = 'mock-refresh-token'
      jest.spyOn(authService, 'refreshAccessToken').mockReturnValue('new-access-token')

      const result = controller.refresh({ refreshToken: mockValidToken })

      expect(result.success).toBe(true)
      expect(result.data.accessToken).toBe('new-access-token')
    })

    it('should throw error with invalid refresh token', () => {
      const invalidToken = 'invalid-token'
      jest.spyOn(authService, 'refreshAccessToken').mockImplementation(() => {
        throw new BadRequestException('INVALID_REFRESH_TOKEN')
      })

      expect(() => controller.refresh({ refreshToken: invalidToken })).toThrow(BadRequestException)
    })
  })

  describe('POST /api/auth/upgrade', () => {
    it('should upgrade anonymous user to authenticated', async () => {
      const anonUser = {
        userId: 'anon-123',
        isAnonymous: true,
        createdAt: Date.now(),
      }

      mockUserRepository.findById.mockResolvedValue(anonUser)
      mockUserRepository.findByUsername.mockResolvedValue(null)
      mockUserRepository.save.mockResolvedValue(undefined)

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      const req = {
        user: {
          userId: 'anon-123',
          isAnonymous: true,
          version: 1,
        },
      }

      const result = await controller.upgrade(req, { username: 'upgraded-user' }, mockResponse)

      expect(result.success).toBe(true)
      expect(result.data.accessToken).toBeTruthy()
      expect(mockResponse.cookie).toHaveBeenCalled()
    })

    it('should reject upgrade if user is not anonymous', async () => {
      const _authenticatedUser = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      mockUserRepository.findById.mockResolvedValue(_authenticatedUser)

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      const req = {
        user: {
          userId: 'user-123',
          isAnonymous: false,
          version: 1,
        },
      }

      const promise = controller.upgrade(req, { username: 'newname' }, mockResponse)

      await expect(promise).rejects.toThrow(BadRequestException)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user information', () => {
      const authenticatedUser = {
        userId: 'user-123',
        isAnonymous: false,
        version: 1,
      }

      const req = { user: authenticatedUser }

      const result = controller.getCurrentUser(req)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(authenticatedUser)
    })

    it('should work with anonymous user', () => {
      const anonUser = {
        userId: 'anon-uuid-456',
        isAnonymous: true,
        version: 1,
      }

      const req = { user: anonUser }

      const result = controller.getCurrentUser(req)

      expect(result.success).toBe(true)
      expect(result.data.isAnonymous).toBe(true)
    })
  })

  describe('cookie handling', () => {
    it('should set httpOnly cookie in production', async () => {
      mockConfigService.get.mockImplementation(((key: string, defaultValue?: unknown) => {
        if (key === 'NODE_ENV') return 'production'
        if (key === 'JWT_SECRET') return 'test-secret'
        return defaultValue
      }) as unknown as ConfigService['get'])

      const mockUser = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      mockUserRepository.findByUsername.mockResolvedValue(mockUser)

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      await controller.login({ username: 'testuser', password: '12345' }, mockResponse)

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        })
      )
    })

    it('should set secure: false cookie in test environment', async () => {
      const mockUser = {
        userId: 'user-123',
        username: 'testuser',
        isAnonymous: false,
        createdAt: Date.now(),
      }

      mockUserRepository.findByUsername.mockResolvedValue(mockUser)

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response

      await controller.login({ username: 'testuser', password: '12345' }, mockResponse)

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      )
    })
  })
})
