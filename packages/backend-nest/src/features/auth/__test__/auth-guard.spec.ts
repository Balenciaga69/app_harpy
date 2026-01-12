import { UnauthorizedException } from '@nestjs/common'
import { IsAuthenticatedGuard, AllowAnonymousGuard } from '../auth.guard'
describe('AuthGuard', () => {
  describe('IsAuthenticatedGuard', () => {
    let guard: IsAuthenticatedGuard
    beforeEach(() => {
      guard = new IsAuthenticatedGuard()
    })
    it('should return user if user exists', () => {
      const mockUser = {
        userId: 'user-123',
        isAnonymous: false,
        version: 1,
      }
      const result = guard.handleRequest(null, mockUser) as unknown as typeof mockUser
      expect(result).toEqual(mockUser)
    })
    it('should throw UnauthorizedException if user is null', () => {
      const func = (): unknown => guard.handleRequest(null, null)
      expect(func).toThrow(UnauthorizedException)
    })
    it('should throw UnauthorizedException if user is undefined', () => {
      const func = (): unknown => guard.handleRequest(null, undefined)
      expect(func).toThrow(UnauthorizedException)
    })
    it('should throw error if err is provided', () => {
      const customError = new Error('Custom auth error')
      const func = (): unknown => guard.handleRequest(customError, { userId: 'user-123' })
      expect(func).toThrow(customError)
    })
    it('should throw UnauthorizedException with UNAUTHORIZED message when err is not Error instance', () => {
      const func = (): unknown => guard.handleRequest('some-error-string', null)
      expect(func).toThrow(UnauthorizedException)
    })
  })
  describe('AllowAnonymousGuard', () => {
    let guard: AllowAnonymousGuard
    beforeEach(() => {
      guard = new AllowAnonymousGuard()
    })
    it('should return user if user exists', () => {
      const mockUser = {
        userId: 'user-123',
        isAnonymous: false,
        version: 1,
      }
      const result = guard.handleRequest(null, mockUser) as unknown as typeof mockUser
      expect(result).toEqual(mockUser)
    })
    it('should return null if user is not authenticated', () => {
      const result = guard.handleRequest(null, null) as unknown as null
      expect(result).toBeNull()
    })
    it('should return null if user is undefined', () => {
      const result = guard.handleRequest(null, undefined) as unknown as null
      expect(result).toBeNull()
    })
    it('should return null on error', () => {
      const error = new Error('Some error')
      const result = guard.handleRequest(error, null) as unknown as null
      expect(result).toBeNull()
    })
    it('should return null even if user is falsy value', () => {
      expect(guard.handleRequest(null, false)).toBeNull()
      expect(guard.handleRequest(null, 0)).toBeNull()
      expect(guard.handleRequest(null, '')).toBeNull()
    })
  })
  describe('guard comparison', () => {
    let authenticatedGuard: IsAuthenticatedGuard
    let anonymousGuard: AllowAnonymousGuard
    beforeEach(() => {
      authenticatedGuard = new IsAuthenticatedGuard()
      anonymousGuard = new AllowAnonymousGuard()
    })
    it('should allow authenticated guard to pass valid user but deny null', () => {
      const user = { userId: 'user-123', isAnonymous: false, version: 1 }
      const resultWithUser = authenticatedGuard.handleRequest(null, user) as unknown as typeof user
      expect(resultWithUser).toEqual(user)
      const func = (): unknown => authenticatedGuard.handleRequest(null, null)
      expect(func).toThrow(UnauthorizedException)
    })
    it('should allow anonymous guard to pass both user and null', () => {
      const user = { userId: 'user-123', isAnonymous: false, version: 1 }
      const resultWithUser = anonymousGuard.handleRequest(null, user) as unknown as typeof user
      expect(resultWithUser).toEqual(user)
      const resultWithoutUser = anonymousGuard.handleRequest(null, null) as unknown as null
      expect(resultWithoutUser).toBeNull()
    })
  })
})
