import { GuestSession } from './guest/guest-session.entity'
import { AccessTokenRecord } from './token/access-token-record.entity'
import { RefreshTokenRecord } from './token/refresh-token-record.entity'
import { AuthenticatedUser } from './user/model/authenticated-user'
import { User } from './user/model/user.entity'

/**
 * JWT Access Token Payload
 * 用於每次 API 請求驗證
 */
export interface JwtAccessPayload {
  sub: string
  username: string
  jti: string
  deviceId: string
  type: 'access'
  iat?: number
  exp?: number
}

/**
 * JWT Refresh Token Payload
 * 用於換發新的 Access Token
 */
export interface JwtRefreshPayload {
  jti: string
  type: 'refresh'
  iat?: number
  exp?: number
}

/**
 * API 回傳的認證 Token
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * 認證後的用戶資訊
 */
export type { AuthenticatedUser }

/**
 * 用戶儲存庫介面
 */
export interface IUserRepository {
  save(user: User): Promise<void>
  findByUsername(username: string): Promise<User | null>
  existsByUsername(username: string): Promise<boolean>
  findActiveByUsername(username: string): Promise<User | null>
}

/**
 * Access Token 儲存庫介面
 */
export interface IAccessTokenRepository {
  save(record: AccessTokenRecord): Promise<void>
  findByJti(jti: string): Promise<AccessTokenRecord | null>
  isBlacklistedByJti(jti: string): Promise<boolean>
  isBlacklistedByDeviceId(userId: string, deviceId: string): Promise<boolean>
  addToBlacklist(jti: string, expiresAt: Date): Promise<void>
  addDeviceToBlacklist(userId: string, deviceId: string, expiresAt: Date): Promise<void>
  addAllDevicesToBlacklist(userId: string): Promise<void>
  deleteByJti(jti: string): Promise<void>
  deleteAllByUserId(userId: string): Promise<void>
}

/**
 * Refresh Token 儲存庫介面
 */
export interface IRefreshTokenRepository {
  save(record: RefreshTokenRecord): Promise<void>
  findByJti(jti: string): Promise<RefreshTokenRecord | null>
  deleteByJti(jti: string): Promise<void>
  deleteAllByUserId(userId: string): Promise<void>
  isBlacklisted(jti: string): Promise<boolean>
  addToBlacklist(jti: string, expiresAt: Date): Promise<void>
}

/**
 * 訪客 Session 儲存庫介面
 */
export interface IGuestRepository {
  save(session: GuestSession): Promise<void>
  findByGuestId(guestId: string): Promise<GuestSession | null>
  existsByGuestId(guestId: string): Promise<boolean>
  deleteByGuestId(guestId: string): Promise<void>
  updateExpiresAt?(guestId: string, expiresAt: Date): Promise<void>
}
