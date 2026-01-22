import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { SESSION_CONFIG } from '../auth.config'
/**
 * Session 過期時間策略
 * 統一管理所有 Session 相關的過期計算邏輯
 */
@Injectable()
export class SessionExpirationPolicy {
  private readonly MAX_SESSION_LIFETIME_SECONDS = 86_400 // 24 小時
  constructor(private readonly configService: ConfigService) {}
  /**
   * 計算過期時間
   * @returns 過期的絕對時間
   */
  calculateExpiresAt(): Date {
    const ttlSeconds = this.configService.get<number>(
      'GUEST_SESSION_TTL_SECONDS',
      SESSION_CONFIG.GUEST_SESSION_TTL_SECONDS
    )
    return new Date(Date.now() + ttlSeconds * 1000)
  }
  /**
   * 檢查 Session 是否已過期
   * @param expiresAt 過期時間
   * @returns true 表示已過期
   */
  isExpired(expiresAt: Date): boolean {
    return expiresAt.getTime() < Date.now()
  }
  /**
   * 檢查 Session 是否超過最大生命週期
   * 用於防止無限延長 Session
   * @param createdAt 建立時間
   * @returns true 表示超過最大生命週期
   */
  isMaxLifetimeExceeded(createdAt: Date): boolean {
    const lifetime = (Date.now() - new Date(createdAt).getTime()) / 1000
    return lifetime > this.MAX_SESSION_LIFETIME_SECONDS
  }
  /**
   * 計算剩餘生命週期（秒數）
   * @param expiresAt 過期時間
   * @returns 剩餘秒數，若已過期則返回 0
   */
  getRemainingSeconds(expiresAt: Date): number {
    const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    return Math.max(0, remaining)
  }
}
