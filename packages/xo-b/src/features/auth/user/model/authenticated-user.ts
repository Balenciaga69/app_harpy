export interface AuthenticatedUser {
  userId: string
  username: string
  jti?: string
  deviceId?: string
  exp?: number
  expiresAt?: Date
}
