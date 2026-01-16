import { UnauthorizedException } from '@nestjs/common'
import { JwtAccessPayload, JwtRefreshPayload } from '../../contracts'
export class JwtValidator {
  static validateAccessTokenType(payload: JwtAccessPayload): void {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }
  }
  static validateRefreshTokenType(payload: JwtRefreshPayload): void {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for refresh')
    }
  }
}
