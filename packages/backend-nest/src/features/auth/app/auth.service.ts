import { BadRequestException, Inject,Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { JwtTokenProvider } from '../infra/jwt-token-provider'
import type { IUserRepository } from './user-repository'
@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
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
    return { token, userId }
  }
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (password !== '12345') {
      throw new BadRequestException('PASSWORD_INVALID')
    }
    let user = await this.userRepository.findByUsername(username)
    if (!user) {
      user = {
        userId: randomUUID(),
        username,
        isAnonymous: false,
        createdAt: Date.now(),
      }
      await this.userRepository.save(user)
    }
    const accessToken = this.tokenProvider.sign(
      {
        sub: user.userId,
        is_anon: false,
        ver: 1,
      },
      { expiresIn: '15m' }
    )
    const refreshToken = this.tokenProvider.sign(
      {
        sub: user.userId,
        is_anon: false,
        ver: 1,
      },
      { expiresIn: '7d' }
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
      { expiresIn: '15m' }
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
      { expiresIn: '15m' }
    )
    const refreshToken = this.tokenProvider.sign(
      {
        sub: authenticatedUser.userId,
        is_anon: false,
        ver: 1,
      },
      { expiresIn: '7d' }
    )
    return { accessToken, refreshToken }
  }
}
