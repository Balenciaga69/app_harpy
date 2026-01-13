import { UnauthorizedException } from '@nestjs/common'
import { IsAuthenticatedGuard, AllowAnonymousGuard } from '../auth.guard'
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
describe('AuthGuard', () => {
  describe('IsAuthenticatedGuard', () => {
    let guard: IsAuthenticatedGuard
    beforeEach(() => {
      guard = new IsAuthenticatedGuard()
    })
    it('should pass authenticated user through', () => {
      const authenticatedUser = {
        userId: 'user-123',
        isAnonymous: false,
        version: 1,
      }
      const result = guard.handleRequest(null, authenticatedUser)
      expect(result).toEqual(authenticatedUser)
    })
    it('should throw UnauthorizedException when user is missing', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException)
      expect(() => guard.handleRequest(null, undefined)).toThrow(UnauthorizedException)
    })
    it('should throw original error if provided', () => {
      const customError = new Error('Authentication failed')
      expect(() => guard.handleRequest(customError, null)).toThrow(customError)
    })
    it('should throw UnauthorizedException when error is not an Error instance', () => {
      expect(() => guard.handleRequest('string-error', null)).toThrow(UnauthorizedException)
    })
  })
  describe('AllowAnonymousGuard', () => {
    let guard: AllowAnonymousGuard
    beforeEach(() => {
      guard = new AllowAnonymousGuard()
    })
    it('should pass authenticated user through', () => {
      const authenticatedUser = {
        userId: 'user-123',
        isAnonymous: false,
        version: 1,
      }
      const result = guard.handleRequest(null, authenticatedUser)
      expect(result).toEqual(authenticatedUser)
    })
    it('should allow access when user is missing by returning null', () => {
      expect(guard.handleRequest(null, null)).toBeNull()
      expect(guard.handleRequest(null, undefined)).toBeNull()
    })
    it('should allow access even when error is present', () => {
      expect(guard.handleRequest(new Error('Some error'), null)).toBeNull()
    })
  })
  describe('guard behavior differences', () => {
    it('authenticated guard blocks anonymous access', () => {
      const authenticatedGuard = new IsAuthenticatedGuard()
      expect(() => authenticatedGuard.handleRequest(null, null)).toThrow(UnauthorizedException)
    })
    it('anonymous guard allows both authenticated and anonymous access', () => {
      const anonymousGuard = new AllowAnonymousGuard()
      const authenticatedUser = { userId: 'user-123', isAnonymous: false, version: 1 }
      expect(anonymousGuard.handleRequest(null, authenticatedUser)).toEqual(authenticatedUser)
      expect(anonymousGuard.handleRequest(null, null)).toBeNull()
    })
  })
})
