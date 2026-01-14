import { randomUUID } from 'crypto'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { JwtTokenProvider } from './jwt-token-provider'
import { PasswordHasher } from './password-hasher'
import type { IUserRepository } from './repository/user-repository'
@Injectable()
export class AuthService {
  private readonly passwordHasher = new PasswordHasher()
  constructor(
    @Inject(InjectionTokens.UserRepository) private readonly userRepository: IUserRepository,
    private readonly tokenProvider: JwtTokenProvider
  ) {}
  async createAnonymousSession(): Promise<{ token: string; userId: string }> {
    const userId = randomUUID()
    const user = await this.userRepository.getOrCreateAnonymous(userId)
    const token = this.tokenProvider.sign({
      sub: user.userId,
      is_anon: true,
      ver: 1,
    })
    return { token, userId: user.userId }
  }
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const mockHash = this.passwordHasher.hash('nonexistent')
    const user = await this.userRepository.findByUsername(username)
    const userType = user as unknown as { passwordHash?: string }
    const hashedPasswordToCheck = user ? userType.passwordHash || mockHash : mockHash
    try {
      const isPasswordValid = this.passwordHasher.verify(password, hashedPasswordToCheck)
      if (!isPasswordValid) {
        throw new BadRequestException('PASSWORD_INVALID')
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('PASSWORD_INVALID')
    }
    // 用戶不存在時拒絕登入
    if (!user) {
      throw new BadRequestException('USER_NOT_FOUND')
    }
    const accessToken = this.tokenProvider.sign(
      {
        sub: user.userId,
        is_anon: false,
        ver: 1,
      },
      '15m'
    )
    const refreshToken = this.tokenProvider.sign(
      {
        sub: user.userId,
        is_anon: false,
        ver: 1,
      },
      '7d'
    )
    return { accessToken, refreshToken }
  }
  refreshAccessToken(refreshToken: string): string {
    let payload
    try {
      payload = this.tokenProvider.verify(refreshToken)
    } catch {
      throw new BadRequestException('INVALID_REFRESH_TOKEN')
    }
    const typedPayload = payload as { sub: string; is_anon: boolean; ver: number }
    return this.tokenProvider.sign(
      {
        sub: typedPayload.sub,
        is_anon: typedPayload.is_anon,
        ver: typedPayload.ver,
      },
      '15m'
    )
  }
  async upgradeAnonymousToAuthenticated(
    anonUserId: string,
    username: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const anonUser = await this.userRepository.findById(anonUserId)
    if (!anonUser || !anonUser.isAnonymous) {
      throw new BadRequestException('INVALID_ANONYMOUS_USER')
    }
    let authenticatedUser = await this.userRepository.findByUsername(username)
    if (!authenticatedUser) {
      authenticatedUser = {
        userId: randomUUID(),
        username,
        isAnonymous: false,
        createdAt: Date.now(),
      }
      await this.userRepository.save(authenticatedUser)
    }
    const accessToken = this.tokenProvider.sign(
      {
        sub: authenticatedUser.userId,
        is_anon: false,
        ver: 1,
      },
      '15m'
    )
    const refreshToken = this.tokenProvider.sign(
      {
        sub: authenticatedUser.userId,
        is_anon: false,
        ver: 1,
      },
      '7d'
    )
    return { accessToken, refreshToken }
  }
}
