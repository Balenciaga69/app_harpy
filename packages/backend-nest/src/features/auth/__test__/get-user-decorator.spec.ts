import { ExecutionContext } from '@nestjs/common'
import { GetUser } from '../get-user.decorator'

describe('GetUser Decorator', () => {
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: jest.fn(),
    } as unknown as jest.Mocked<ExecutionContext>
  })

  it('should extract user from request object', () => {
    const mockUser = {
      userId: 'user-123',
      isAnonymous: false,
      version: 1,
    }

    const mockRequest = {
      user: mockUser,
    }

    mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest)

    const result = GetUser({}, mockExecutionContext) as unknown as typeof mockUser

    expect(result).toEqual(mockUser)
  })

  it('should return undefined if user property does not exist', () => {
    const mockRequest = {}

    mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest)

    const result = GetUser({}, mockExecutionContext)

    expect(result).toBeUndefined()
  })

  it('should return null if user is explicitly set to null', () => {
    const mockRequest = {
      user: null,
    }

    mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest)

    const result = GetUser({}, mockExecutionContext)

    expect(result).toBeNull()
  })

  it('should handle anonymous user', () => {
    const mockAnonUser = {
      userId: 'anon-uuid-456',
      isAnonymous: true,
      version: 1,
    }

    const mockRequest = {
      user: mockAnonUser,
    }

    mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest)

    const result = GetUser({}, mockExecutionContext) as unknown as typeof mockAnonUser

    expect(result).toEqual(mockAnonUser)
    expect(result.isAnonymous).toBe(true)
  })

  it('should work with different user objects', () => {
    const mockUser = {
      userId: 'different-user',
      isAnonymous: false,
      version: 2,
      customField: 'custom-value',
    }

    const mockRequest = {
      user: mockUser,
    }

    mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue(mockRequest)

    const result = GetUser({}, mockExecutionContext) as unknown as typeof mockUser

    expect(result).toEqual(mockUser)
    expect(result.customField).toBe('custom-value')
  })
})
