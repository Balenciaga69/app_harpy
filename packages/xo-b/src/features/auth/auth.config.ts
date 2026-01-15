/**
 * JWT 與密碼配置
 * 集中管理所有認證相關的常數
 */
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
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
