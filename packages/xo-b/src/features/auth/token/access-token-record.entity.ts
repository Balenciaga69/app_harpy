export interface AccessTokenRecord {
  jti: string
  userId: string
  deviceId: string
  createdAt: Date
  expiresAt: Date
}
