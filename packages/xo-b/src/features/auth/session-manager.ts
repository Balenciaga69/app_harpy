import { Injectable } from '@nestjs/common'
import { IAccessTokenRepository } from './contracts'
import { IRefreshTokenRepository } from './contracts'

/**
 * Session 管理器
 * 集中處理所有與 session 和登出相關的邏輯
 */
@Injectable()
export class SessionManager {
  constructor(
    private readonly accessTokenRepo: IAccessTokenRepository,
    private readonly refreshTokenRepo: IRefreshTokenRepository
  ) {}

  /**
   * 將指定裝置的 access token 加入黑名單
   * 用於單一裝置登出
   */
  async logoutDevice(userId: string, deviceId: string, expiresAt: Date): Promise<void> {
    await this.accessTokenRepo.addDeviceToBlacklist(userId, deviceId, expiresAt)
  }

  /**
   * 登出所有裝置
   * 黑名單所有 access token 並刪除所有 refresh token
   */
  async logoutAllDevices(userId: string): Promise<void> {
    await this.accessTokenRepo.addAllDevicesToBlacklist(userId)
    await this.refreshTokenRepo.deleteAllByUserId(userId)
  }

  /**
   * 撤銷指定的 refresh token
   * 用於主動吊銷 token（如安全事件）
   */
  async revokeRefreshToken(jti: string, expiresAt: Date): Promise<void> {
    await this.refreshTokenRepo.addToBlacklist(jti, expiresAt)
    await this.refreshTokenRepo.deleteByJti(jti)
  }
}
