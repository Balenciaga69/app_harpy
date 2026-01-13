import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtTokenProvider } from '../jwt-token-provider'
describe('JwtTokenProvider', () => {
  let provider: JwtTokenProvider
  let otherProvider: JwtTokenProvider
  let configService: jest.Mocked<ConfigService>
  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key'
        return defaultValue
      }),
    } as unknown as jest.Mocked<ConfigService>
    provider = new JwtTokenProvider(configService)
    // 用不同的 secret 建立另一個 provider，用於測試密鑰隔離
    const otherConfigService = {
      get: jest.fn(() => 'different-secret-key'),
    } as unknown as jest.Mocked<ConfigService>
    otherProvider = new JwtTokenProvider(otherConfigService)
  })
  describe('sign', () => {
    it('should sign payload with default 15m expiration', () => {
      const payload = { sub: 'user-123', is_anon: false, ver: 1 }
      const token = provider.sign(payload)
      const decoded = provider.verify(token)
      expect(decoded.sub).toBe(payload.sub)
      expect(decoded.is_anon).toBe(payload.is_anon)
      expect(decoded.ver).toBe(payload.ver)
    })
    it('should sign payload with custom expiration', () => {
      const payload = { sub: 'user-456', is_anon: true, ver: 1 }
      const token = provider.sign(payload, '7d')
      const decoded = provider.verify(token)
      expect(decoded.sub).toBe('user-456')
      expect(decoded.is_anon).toBe(true)
    })
  })
  describe('verify', () => {
    it('should throw when token format is invalid', () => {
      expect(() => provider.verify('invalid.token.here')).toThrow(UnauthorizedException)
    })
    it('should throw when token is tampered', () => {
      const payload = { sub: 'user-123', is_anon: false, ver: 1 }
      const token = provider.sign(payload)
      const tamperedToken = token.slice(0, -5) + 'XXXXX'
      expect(() => provider.verify(tamperedToken)).toThrow(UnauthorizedException)
    })
    it('should throw when token is expired', (done) => {
      const payload = { sub: 'user-123', is_anon: false, ver: 1 }
      const token = provider.sign(payload, '1ms')
      setTimeout(() => {
        expect(() => provider.verify(token)).toThrow(UnauthorizedException)
        done()
      }, 100)
    })
    it('should throw when secret mismatch', () => {
      const payload = { sub: 'user-123', is_anon: false, ver: 1 }
      const token = provider.sign(payload)
      expect(() => otherProvider.verify(token)).toThrow(UnauthorizedException)
    })
  })
  describe('token lifecycle', () => {
    it('should maintain authenticated user identity', () => {
      const userPayload = { sub: 'user-789', is_anon: false, ver: 1 }
      const token = provider.sign(userPayload)
      const decoded = provider.verify(token)
      expect(decoded.sub).toBe('user-789')
      expect(decoded.is_anon).toBe(false)
      expect(decoded.ver).toBe(1)
    })
    it('should maintain anonymous user identity', () => {
      const anonPayload = { sub: 'anon-uuid-abc', is_anon: true, ver: 1 }
      const token = provider.sign(anonPayload)
      const decoded = provider.verify(token)
      expect(decoded.is_anon).toBe(true)
      expect(decoded.sub).toBe('anon-uuid-abc')
    })
    it('should handle payload transformation through decode-recode cycle', () => {
      const originalPayload = { sub: 'user-integrity-test', is_anon: false, ver: 2 }
      // First cycle
      const token1 = provider.sign(originalPayload)
      const decoded1 = provider.verify(token1)
      // Verify payload structure preserved (without exp/iat)
      expect(decoded1.sub).toBe(originalPayload.sub)
      expect(decoded1.is_anon).toBe(originalPayload.is_anon)
      expect(decoded1.ver).toBe(originalPayload.ver)
      // Second cycle - create new token with extracted payload
      const token2 = provider.sign({
        sub: decoded1.sub,
        is_anon: decoded1.is_anon,
        ver: decoded1.ver,
      })
      const decoded2 = provider.verify(token2)
      expect(decoded2.sub).toBe(originalPayload.sub)
      expect(decoded2.is_anon).toBe(originalPayload.is_anon)
      expect(decoded2.ver).toBe(originalPayload.ver)
    })
  })
})
