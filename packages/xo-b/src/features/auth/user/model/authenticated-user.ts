export interface AuthenticatedUser {
  userId: string
  username: string
  jti?: string
  deviceId?: string
}
