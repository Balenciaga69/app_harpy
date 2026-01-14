import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { PASSWORD_CONFIG, JWT_CONFIG } from '../auth.config'
import { User } from './model/user.entity'
import { RedisRefreshTokenRepository } from './repository/refresh-token.repository'
import { RedisUserRepository } from './repository/user.repository'
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
export interface JwtAccessPayload {
  userId: string
  username: string
}
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: RedisUserRepository,
    private readonly refreshTokenRepository: RedisRefreshTokenRepository,
    private readonly jwtService: JwtService
  ) {}
  async register(username: string, password: string): Promise<{ userId: string }> {
    const existsUser = await this.userRepository.existsByUsername(username)
    if (existsUser) {
      throw new ConflictException('帳號已存在')
    }
    const passwordHash = await bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_ROUNDS)
    const userId = nanoid()
    const now = new Date()
    const user: User = {
      id: userId,
      username,
      passwordHash,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }
    await this.userRepository.save(user)
    return { userId }
  }
  async login(userId: string, username: string): Promise<AuthTokens> {
    const accessTokenPayload: JwtAccessPayload = {
      userId,
      username,
    }
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS,
    })
    const jti = nanoid()
    const now = new Date()
    const refreshTokenExpiresAt = new Date(now.getTime() + JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS * 1000)
    await this.refreshTokenRepository.save({
      jti,
      userId,
      createdAt: now,
      expiresAt: refreshTokenExpiresAt,
    })
    const refreshToken = this.jwtService.sign({ jti }, { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS })
    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS,
    }
  }
  async refreshAccessToken(jti: string, userId: string, username: string): Promise<AuthTokens> {
    // 驗證參數不為空且為字串
    if (
      !jti ||
      !userId ||
      !username ||
      typeof jti !== 'string' ||
      typeof userId !== 'string' ||
      typeof username !== 'string'
    ) {
      throw new UnauthorizedException('無效的 Token 刷新請求')
    }
    const isBlacklisted = await this.refreshTokenRepository.isBlacklisted(jti)
    if (isBlacklisted) {
      throw new UnauthorizedException('Token 已被撤銷')
    }
    const record = await this.refreshTokenRepository.findByJti(jti)
    if (!record || record.userId !== userId) {
      throw new UnauthorizedException('無效的 Refresh Token')
    }
    return this.login(userId, username)
  }
  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteAllByUserId(userId)
  }
  async revokeToken(jti: string): Promise<void> {
    const record = await this.refreshTokenRepository.findByJti(jti)
    if (record) {
      await this.refreshTokenRepository.addToBlacklist(jti, record.expiresAt)
      await this.refreshTokenRepository.deleteByJti(jti)
    }
  }
}
