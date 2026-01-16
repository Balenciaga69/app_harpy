import { JwtAccessPayload, JwtRefreshPayload } from '../../contracts'
import { AuthenticatedUser } from '../model/authenticated-user'
export class AuthenticatedUserBuilder {
  static fromAccessPayload(payload: JwtAccessPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
      deviceId: payload.deviceId,
      exp: payload.exp,
    }
  }
  static fromRefreshPayload(payload: JwtRefreshPayload, deviceId?: string): AuthenticatedUser {
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
      deviceId: deviceId,
      exp: payload.exp,
    }
  }
}
