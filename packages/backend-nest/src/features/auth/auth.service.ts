import { randomUUID } from 'crypto'
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { PasswordService } from './password.service'
import type { IUserRepository } from './repository/user-repository'

export interface JwtPayload {
  sub: string
  is_anon: boolean
  ver: number
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(InjectionTokens.UserRepository) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService
  ) {}
  async createAnonymousSession(): Promise<{ token: string; userId: string }> {
    const userId = randomUUID()
    const user = await this.userRepository.getOrCreateAnonymous(userId)
    const token = this.jwtService.sign({
      sub: user.userId,
      is_anon: true,
      ver: 1,
    })
    return { token, userId: user.userId }
  }
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByUsername(username)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const userWithPassword = user as unknown as { passwordHash?: string }
    const isPasswordValid = await this.passwordService.verify(password, userWithPassword.passwordHash || '')

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload: JwtPayload = {
      sub: user.userId,
      is_anon: false,
      ver: 1,
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

    return { accessToken, refreshToken }
  }
  refreshAccessToken(refreshToken: string): string {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken)
      return this.jwtService.sign(payload, { expiresIn: '15m' })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
  async upgradeAnonymousToAuthenticated(
    anonUserId: string,
    username: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const anonUser = await this.userRepository.findById(anonUserId)
    if (!anonUser?.isAnonymous) {
      throw new BadRequestException('User is not anonymous')
    }

    const existingUser = await this.userRepository.findByUsername(username)
    if (existingUser) {
      throw new BadRequestException('Username already exists')
    }

    const authenticatedUser = {
      ...anonUser,
      username,
      isAnonymous: false,
    }

    await this.userRepository.save(authenticatedUser)

    const payload: JwtPayload = {
      sub: authenticatedUser.userId,
      is_anon: false,
      ver: 1,
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

    return { accessToken, refreshToken }
  }
}
