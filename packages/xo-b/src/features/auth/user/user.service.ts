import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { ApiErrorCode } from 'src/features/shared/errors/ApiErrorCode'
import { Result } from 'src/from-xo-c'
import { JWT_CONFIG, PASSWORD_CONFIG } from '../auth.config'
import { AuthTokens, JwtAccessPayload } from '../contracts'
import { SessionManager } from '../session-manager'
import { RedisAccessTokenRepository } from '../token/access-token.repository'
import { RedisRefreshTokenRepository } from '../token/refresh-token.repository'
import { User } from './model/user.entity'
import { RedisUserRepository } from './repository/user.repository'
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: RedisUserRepository,
    private readonly refreshTokenRepository: RedisRefreshTokenRepository,
    private readonly accessTokenRepository: RedisAccessTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionManager: SessionManager
  ) {}
  /** Register a new user */
  async register(username: string, password: string): Promise<Result<{ userId: string }>> {
    const existsUser = await this.userRepository.existsByUsername(username)
    if (existsUser) {
      return Result.fail(ApiErrorCode.參數_驗證失敗)
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
    return Result.success({ userId })
  }
  /** 派發新的 auth tokens */
  async login(userId: string, username: string): Promise<Result<AuthTokens>> {
    const accessJti = nanoid()
    const refreshJti = nanoid()
    const deviceId = nanoid()
    const accessTokenExpirySeconds = this.configService.get<number>(
      'ACCESS_TOKEN_EXPIRY_SECONDS',
      JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
    )
    const refreshTokenExpirySeconds = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRY_SECONDS',
      JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS
    )
    const accessTokenPayload: JwtAccessPayload = {
      sub: userId,
      username,
      jti: accessJti,
      deviceId,
      type: 'access',
    }
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: accessTokenExpirySeconds,
    })
    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + accessTokenExpirySeconds * 1000)
    const refreshTokenExpiresAt = new Date(now.getTime() + refreshTokenExpirySeconds * 1000)
    await this.accessTokenRepository.save({
      jti: accessJti,
      userId,
      deviceId,
      createdAt: now,
      expiresAt: accessTokenExpiresAt,
    })
    await this.refreshTokenRepository.save({
      jti: refreshJti,
      userId,
      deviceId,
      createdAt: now,
      expiresAt: refreshTokenExpiresAt,
    })
    const refreshToken = this.jwtService.sign(
      { jti: refreshJti, type: 'refresh' },
      { expiresIn: refreshTokenExpirySeconds }
    )
    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpirySeconds,
    })
  }
  async refreshAccessToken(jti: string, userId: string, username: string): Promise<Result<AuthTokens>> {
    if (
      !jti ||
      !userId ||
      !username ||
      typeof jti !== 'string' ||
      typeof userId !== 'string' ||
      typeof username !== 'string'
    ) {
      return Result.fail(ApiErrorCode.認證_認證無效)
    }
    const isBlacklisted = await this.refreshTokenRepository.isBlacklisted(jti)
    if (isBlacklisted) {
      return Result.fail(ApiErrorCode.認證_令牌過期)
    }
    const record = await this.refreshTokenRepository.findByJti(jti)
    if (!record || record.userId !== userId) {
      return Result.fail(ApiErrorCode.認證_認證無效)
    }
    return this.login(userId, username)
  }
  /** 將指定的 deviceId 加入 access token 黑名單 */
  async logoutThisDevice(userId: string, deviceId: string, accessTokenExpiresAt: Date): Promise<void> {
    await this.sessionManager.logoutDevice(userId, deviceId, accessTokenExpiresAt)
  }
  /** 刪除所有 access token 和 refresh token */
  async logoutAllDevices(userId: string): Promise<void> {
    await this.sessionManager.logoutAllDevices(userId)
  }
  /** 將指定的 refresh token 加入黑名單並刪除 */
  async revokeToken(jti: string): Promise<void> {
    const record = await this.refreshTokenRepository.findByJti(jti)
    if (record) {
      await this.sessionManager.revokeRefreshToken(jti, record.expiresAt)
    }
  }
}
