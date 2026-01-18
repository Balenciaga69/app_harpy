import { AuthenticatedUser } from './user/model/authenticated-user'
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
/** 用於換發新的 Access Token */
export interface JwtRefreshPayload {
  sub: string
  username: string
  jti: string
  type: 'refresh'
  iat?: number
  exp: number
}
/** API 回傳的認證 Token */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
/** 認證後的用戶資訊 */
export type { AuthenticatedUser }
