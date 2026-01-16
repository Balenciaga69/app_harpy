/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { IRefreshTokenRepository, JwtRefreshPayload } from '../../contracts'
import { JwtConfigHelper } from '../helpers/jwt-config.helper'
import { JwtExtractorFactory } from '../helpers/jwt-extractor.factory'
import { JwtValidator } from '../helpers/jwt-validator.helper'
import { AuthenticatedUser } from '../model/authenticated-user'
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    readonly configService: ConfigService,
    @Inject(InjectionTokens.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {
    const secret = JwtConfigHelper.getValidatedSecret(configService, 'JwtRefreshStrategy')
    super({
      jwtFromRequest: JwtExtractorFactory.createRefreshTokenExtractor(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }
  async validate(payload: JwtRefreshPayload): Promise<AuthenticatedUser> {
    // 驗證 Token 類型
    JwtValidator.validateRefreshTokenType(payload)
    // 檢查 Refresh Token 是否被黑名單
    const isBlacklisted = await this.refreshTokenRepository.isBlacklisted(payload.jti)
    if (isBlacklisted) {
      throw new Error('Refresh token has been revoked')
    }
    // 檢查資料庫中是否存在該紀錄 (確保沒被刪除)
    const record = await this.refreshTokenRepository.findByJti(payload.jti)
    if (!record) {
      throw new Error('Refresh token not found')
    }
    // 回傳 Payload 供 Controller 使用
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
      deviceId: record.deviceId,
      expiresAt: new Date(payload.exp * 1000),
    }
  }
}
