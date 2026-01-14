export interface RefreshTokenRecord {
  jti: string
  userId: string
  deviceId?: string
  createdAt: Date
  expiresAt: Date
}
