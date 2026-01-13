import { ExecutionContext } from '@nestjs/common'
describe('GetUser Decorator', () => {
  const extractUserFromRequest = (ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>()
    return (request as unknown as { user?: unknown }).user
  }
  const createMockExecutionContext = (userValue: unknown): jest.Mocked<ExecutionContext> => {
    const mockRequest = { user: userValue }
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as jest.Mocked<ExecutionContext>
  }
  it('should extract authenticated user from request', () => {
    const authenticatedUser = {
      userId: 'user-123',
      isAnonymous: false,
      version: 1,
    }
    const context = createMockExecutionContext(authenticatedUser)
    const result = extractUserFromRequest(context)
    expect(result).toEqual(authenticatedUser)
  })
  it('should extract anonymous user from request', () => {
    const anonymousUser = {
      userId: 'anon-uuid-456',
      isAnonymous: true,
      version: 1,
    }
    const context = createMockExecutionContext(anonymousUser)
    const result = extractUserFromRequest(context)
    expect(result).toEqual(anonymousUser)
  })
  it('should return undefined when user property does not exist', () => {
    const context = createMockExecutionContext(undefined)
    const result = extractUserFromRequest(context)
    expect(result).toBeUndefined()
  })
  it('should return null when user is explicitly null', () => {
    const context = createMockExecutionContext(null)
    const result = extractUserFromRequest(context)
    expect(result).toBeNull()
  })
})
