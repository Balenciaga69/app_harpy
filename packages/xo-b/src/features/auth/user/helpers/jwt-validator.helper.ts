import { UnauthorizedException } from '@nestjs/common'

import { JwtAccessPayload, JwtRefreshPayload } from '../../contracts'
/**
 * 幫助類: 驗證 JWT Payload Fields
 */
export const JwtValidator = {
  /**
   * Access Token Type 驗證
   */
  validateAccessTokenType(payload: JwtAccessPayload): void {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }
  },
  /**
   * Refresh Token Type 驗證
   */
  validateRefreshTokenType(payload: JwtRefreshPayload): void {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for refresh')
    }
  },
}
