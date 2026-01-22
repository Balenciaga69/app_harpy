import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { ApiErrorCode } from 'src/features/shared/errors/ApiErrorCode'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { Result } from 'src/from-xo-c'

import { JWT_CONFIG, PASSWORD_CONFIG } from '../auth.config'
import { AuthTokens, JwtAccessPayload } from '../contracts'
import { SessionManager } from '../session-manager'
import { IAccessTokenRepository } from '../token/access-token.repository'
import { IRefreshTokenRepository } from '../token/refresh-token.repository'
import { User } from './model/user.entity'
import { IUserRepository } from './repository/user.repository'
@Injectable()
export class UserService {
  constructor(
    @Inject(InjectionTokens.UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(InjectionTokens.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(InjectionTokens.AccessTokenRepository)
    private readonly accessTokenRepository: IAccessTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionManager: SessionManager
  ) {}
  /**
   * 註冊用戶帳號
   */
  async register(username: string, password: string): Promise<Result<{ userId: string }>> {
    const existsUser = await this.userRepository.existsByUsername(username)
    if (existsUser) {
      return Result.fail(ApiErrorCode.註冊_帳號已存在)
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
  /**
   * 登入並生成 訪問,刷新令牌
   */
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
      {
        sub: userId,
        username,
        jti: refreshJti,
        type: 'refresh',
      },
      { expiresIn: refreshTokenExpirySeconds }
    )
    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpirySeconds,
    })
  }
  /**
   * 刷新訪問令牌
   */
  async refreshAccessToken(
    jti: string,
    userId: string,
    username: string,
    originalExpiresAt: Date
  ): Promise<Result<AuthTokens>> {
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
    // 撤銷舊的 Refresh Token
    await this.refreshTokenRepository.deleteByJti(jti)
    // 生成新的 Access Token (保持原有的 deviceId)
    const accessJti = nanoid()
    const deviceId = record.deviceId || nanoid()
    const accessTokenExpirySeconds = this.configService.get<number>(
      'ACCESS_TOKEN_EXPIRY_SECONDS',
      JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
    )
    const now = new Date()
    const accessTokenExpiresAt = new Date(now.getTime() + accessTokenExpirySeconds * 1000)
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
    await this.accessTokenRepository.save({
      jti: accessJti,
      userId,
      deviceId,
      createdAt: now,
      expiresAt: accessTokenExpiresAt,
    })
    // 生成新的 Refresh Token (繼承原始過期時間 防止無限續期)
    const newRefreshJti = nanoid()
    const remainingSeconds = Math.floor((originalExpiresAt.getTime() - now.getTime()) / 1000)
    // 如果剩餘時間過短 就不再發放新的 Refresh Token 或者過期了
    if (remainingSeconds <= 0) {
      return Result.fail(ApiErrorCode.認證_令牌過期)
    }
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        username,
        jti: newRefreshJti,
        type: 'refresh',
      },
      { expiresIn: remainingSeconds }
    )
    await this.refreshTokenRepository.save({
      jti: newRefreshJti,
      userId,
      deviceId: record.deviceId,
      createdAt: now,
      expiresAt: originalExpiresAt,
    })
    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpirySeconds,
    })
  }
  /**
   * 將指定的 deviceId 加入 access token 黑名單
   */
  async logoutThisDevice(userId: string, deviceId: string, accessTokenExpiresAt: Date): Promise<void> {
    await this.sessionManager.logoutDevice(userId, deviceId, accessTokenExpiresAt)
  }
  /**
   * 刪除所有 access token 和 refresh token
   */
  async logoutAllDevices(userId: string): Promise<void> {
    await this.sessionManager.logoutAllDevices(userId)
  }
  /**
   * 將指定的 refresh token 加入黑名單並刪除
   */
  async revokeToken(jti: string): Promise<void> {
    const record = await this.refreshTokenRepository.findByJti(jti)
    if (record) {
      await this.sessionManager.revokeRefreshToken(jti, record.expiresAt)
    }
  }
}
