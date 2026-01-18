import { UnauthorizedException } from '@nestjs/common'
import { JwtAccessPayload, JwtRefreshPayload } from '../../contracts'
/**
 * 幫助類: 驗證 JWT Payload Fields
 */
export class JwtValidator {
  /**
   * Access Token Type 驗證
   */
  static validateAccessTokenType(payload: JwtAccessPayload): void {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }
  }
  /**
   * Refresh Token Type 驗證
   */
  static validateRefreshTokenType(payload: JwtRefreshPayload): void {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for refresh')
    }
  }
}
