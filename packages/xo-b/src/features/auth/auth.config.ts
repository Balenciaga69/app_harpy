/**
 * JWT 與密碼配置
 * 集中管理所有認證相關的常數
 */
export const JWT_CONFIG = {
  ALGORITHM: 'HS256',
  ACCESS_TOKEN_EXPIRY_SECONDS: 900, // 15 分鐘
  REFRESH_TOKEN_EXPIRY_SECONDS: 2592000, // 30 天
} as const
export const PASSWORD_CONFIG = {
  BCRYPT_ROUNDS: 10,
  MIN_LENGTH: 8,
} as const
export const SESSION_CONFIG = {
  GUEST_SESSION_TTL_SECONDS: 3600, // 1 小時
} as const
export const REDIS_KEYS = {
  REFRESH_TOKEN_RECORD: 'refresh-token',
  USER_TOKENS: 'user-tokens',
  BLACKLIST: 'blacklist',
  GUEST_SESSION: 'guest',
  ACCESS_TOKEN: 'access-token',
  USER_DEVICES: 'user-devices',
  ACCESS_TOKEN_BLACKLIST: 'access-token-blacklist',
} as const
