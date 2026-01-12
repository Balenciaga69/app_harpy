import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtTokenProvider } from '../jwt-token-provider'

describe('JwtTokenProvider', () => {
  let provider: JwtTokenProvider
  let configService: jest.Mocked<ConfigService>

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key'
        return defaultValue
      }),
    } as unknown as jest.Mocked<ConfigService>

    provider = new JwtTokenProvider(configService)
  })

  describe('sign', () => {
    it('should create valid JWT token with default expiration (15m)', () => {
      const payload = {
        sub: 'user-123',
        is_anon: false,
        ver: 1,
      }

      const token = provider.sign(payload)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('should create valid JWT token with custom expiration', () => {
      const payload = {
        sub: 'user-456',
        is_anon: true,
        ver: 1,
      }

      const token = provider.sign(payload, '7d')

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })

    it('should include payload data in signed token', () => {
      const payload = {
        sub: 'test-user',
        is_anon: false,
        ver: 1,
      }

      const token = provider.sign(payload)
      const verified = provider.verify(token)

      expect(verified.sub).toBe('test-user')
      expect(verified.is_anon).toBe(false)
      expect(verified.ver).toBe(1)
    })
  })

  describe('verify', () => {
    it('should decode valid token and return payload', () => {
      const payload = {
        sub: 'user-123',
        is_anon: false,
        ver: 1,
      }

      const token = provider.sign(payload)
      const verified = provider.verify(token)

      expect(verified.sub).toBe(payload.sub)
      expect(verified.is_anon).toBe(payload.is_anon)
      expect(verified.ver).toBe(payload.ver)
    })

    it('should throw UnauthorizedException on invalid token', () => {
      const invalidToken = 'invalid.token.here'

      expect(() => provider.verify(invalidToken)).toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException on tampered token', () => {
      const payload = {
        sub: 'user-123',
        is_anon: false,
        ver: 1,
      }

      const token = provider.sign(payload)
      const tamperedToken = token.slice(0, -5) + 'XXXXX'

      expect(() => provider.verify(tamperedToken)).toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException on expired token', (done) => {
      const payload = {
        sub: 'user-123',
        is_anon: false,
        ver: 1,
      }

      const token = provider.sign(payload, '1ms')

      setTimeout(() => {
        expect(() => provider.verify(token)).toThrow(UnauthorizedException)
        done()
      }, 100)
    })
  })

  describe('integration', () => {
    it('should handle anonymous user tokens', () => {
      const anonPayload = {
        sub: 'anon-uuid-123',
        is_anon: true,
        ver: 1,
      }

      const token = provider.sign(anonPayload)
      const verified = provider.verify(token)

      expect(verified.is_anon).toBe(true)
    })

    it('should handle authenticated user tokens', () => {
      const authPayload = {
        sub: 'auth-user-456',
        is_anon: false,
        ver: 1,
      }

      const token = provider.sign(authPayload, '15m')
      const verified = provider.verify(token)

      expect(verified.is_anon).toBe(false)
    })
  })
})
