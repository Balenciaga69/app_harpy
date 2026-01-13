import { ConfigService } from '@nestjs/config'
import type { JwtPayload } from '../jwt-token-provider'
import { JwtStrategy } from '../jwt.strategy'
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
    it('should preserve version information from payload', () => {
      const payload: JwtPayload = {
        sub: 'user-789',
        is_anon: false,
        ver: 2,
      }
      const result = strategy.validate(payload)
      expect(result.version).toBe(2)
    })
  })
})
