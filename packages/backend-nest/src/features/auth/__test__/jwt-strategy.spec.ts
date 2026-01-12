import { ConfigService } from '@nestjs/config'
import type { JwtPayload } from '../jwt-token-provider'
import { JwtStrategy, type AuthenticatedUser } from '../jwt.strategy'
describe('JwtStrategy', () => {
  let strategy: JwtStrategy
  let configService: jest.Mocked<ConfigService>
  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key'
        return defaultValue
      }),
    } as unknown as jest.Mocked<ConfigService>
    strategy = new JwtStrategy(configService)
  })
  describe('validate', () => {
    it('should convert JWT payload to AuthenticatedUser', () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        is_anon: false,
        ver: 1,
      }
      const result = strategy.validate(payload)
      expect(result).toEqual({
        userId: 'user-123',
        isAnonymous: false,
        version: 1,
      })
    })
    it('should handle anonymous user payload', () => {
      const payload: JwtPayload = {
        sub: 'anon-uuid-456',
        is_anon: true,
        ver: 1,
      }
      const result = strategy.validate(payload)
      expect(result.userId).toBe('anon-uuid-456')
      expect(result.isAnonymous).toBe(true)
      expect(result.version).toBe(1)
    })
    it('should preserve version information', () => {
      const payload: JwtPayload = {
        sub: 'user-789',
        is_anon: false,
        ver: 2,
      }
      const result = strategy.validate(payload)
      expect(result.version).toBe(2)
    })
    it('should return AuthenticatedUser with correct properties', () => {
      const payload: JwtPayload = {
        sub: 'test-user',
        is_anon: false,
        ver: 1,
      }
      const result: AuthenticatedUser = strategy.validate(payload)
      expect(result).toHaveProperty('userId')
      expect(result).toHaveProperty('isAnonymous')
      expect(result).toHaveProperty('version')
      expect(Object.keys(result).length).toBe(3)
    })
  })
  describe('jwtFromRequest', () => {
    it('should extract token from Authorization header with Bearer prefix', () => {
      const req = {
        headers: {
          authorization: 'Bearer valid-token-123',
        },
      }
      const jwtFromRequest = (strategy as unknown as { jwtFromRequest: unknown }).jwtFromRequest as (
        req: unknown
      ) => string | null
      const token = jwtFromRequest(req)
      expect(token).toBe('valid-token-123')
    })
    it('should return null if no Authorization header', () => {
      const req = {
        headers: {},
      }
      const jwtFromRequest = (strategy as unknown as { jwtFromRequest: unknown }).jwtFromRequest as (
        req: unknown
      ) => string | null
      const token = jwtFromRequest(req)
      expect(token).toBeNull()
    })
    it('should return null if Authorization header missing Bearer prefix', () => {
      const req = {
        headers: {
          authorization: 'Basic invalid',
        },
      }
      const jwtFromRequest = (strategy as unknown as { jwtFromRequest: unknown }).jwtFromRequest as (
        req: unknown
      ) => string | null
      const token = jwtFromRequest(req)
      expect(token).toBeNull()
    })
  })
})
