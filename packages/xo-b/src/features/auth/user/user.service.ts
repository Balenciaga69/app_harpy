import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { ApiErrorCode } from 'src/features/shared/errors/ApiErrorCode'
import { Result } from 'src/from-xo-c'
import { JWT_CONFIG, PASSWORD_CONFIG } from '../auth.config'
import { User } from './model/user.entity'
import { RedisAccessTokenRepository } from '../token/access-token.repository'
import { RedisRefreshTokenRepository } from '../token/refresh-token.repository'
import { RedisUserRepository } from './repository/user.repository'
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
export interface JwtAccessPayload {
  sub: string
  username: string
  jti: string
  type: 'access'
  deviceId: string
  deviceName?: string
}
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: RedisUserRepository,
    private readonly refreshTokenRepository: RedisRefreshTokenRepository,
    private readonly accessTokenRepository: RedisAccessTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
  async register(username: string, password: string): Promise<Result<{ userId: string }, ApiErrorCode>> {
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
  async login(userId: string, username: string): Promise<Result<AuthTokens, ApiErrorCode>> {
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
      type: 'access',
      deviceId,
    }
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: accessTokenExpirySeconds,
    })
    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + accessTokenExpirySeconds * 1000)
    const refreshTokenExpiresAt = new Date(now.getTime() + refreshTokenExpirySeconds * 1000)
    // 保存 Access Token 記錄用於黑名單驗證
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
  async refreshAccessToken(jti: string, userId: string, username: string): Promise<Result<AuthTokens, ApiErrorCode>> {
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
  /**
   * 登出此裝置
   * 只黑名單該裝置的 Access Token，其他裝置保持活躍
   */
  async logoutThisDevice(userId: string, deviceId: string, accessTokenExpiresAt: Date): Promise<void> {
    await this.accessTokenRepository.addDeviceToBlacklist(userId, deviceId, accessTokenExpiresAt)
  }
  /**
   * 登出所有裝置
   * 黑名單該用戶的所有 Access Token 與 Refresh Token
   */
  async logoutAllDevices(userId: string): Promise<void> {
    await this.accessTokenRepository.addAllDevicesToBlacklist(userId)
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
