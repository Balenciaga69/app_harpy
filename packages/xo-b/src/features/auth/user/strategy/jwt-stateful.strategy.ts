import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'

import { JwtAccessPayload } from '../../contracts'
import { IAccessTokenRepository } from '../../token/access-token.repository'
import { AuthenticatedUserBuilder } from '../helpers/authenticated-user.builder'
import { JwtConfigHelper } from '../helpers/jwt-config.helper'
import { JwtExtractorFactory } from '../helpers/jwt-extractor.factory'
import { JwtValidator } from '../helpers/jwt-validator.helper'
import { AuthenticatedUser } from '../model/authenticated-user'
@Injectable()
export class JwtStatefulStrategy extends PassportStrategy(Strategy, 'jwt-stateful') {
  constructor(
    readonly configService: ConfigService,
    @Inject(InjectionTokens.AccessTokenRepository)
    private readonly accessTokenRepository: IAccessTokenRepository
  ) {
    const secret = JwtConfigHelper.getValidatedSecret(configService, 'JwtStatefulStrategy')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest: JwtExtractorFactory.createAccessTokenExtractor(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }
  async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
    // 驗證 Token 類型
    JwtValidator.validateAccessTokenType(payload)
    // 檢查是否被黑名單
    const isBlacklistedByJti = await this.accessTokenRepository.isBlacklistedByJti(payload.jti)
    if (isBlacklistedByJti) {
      throw new Error('Token has been revoked')
    }
    // 檢查該裝置是否被登出
    if (payload.deviceId) {
      const isDeviceBlacklisted = await this.accessTokenRepository.isBlacklistedByDeviceId(
        payload.sub,
        payload.deviceId
      )
      if (isDeviceBlacklisted) {
        throw new Error('Device session has been terminated')
      }
    }
    return AuthenticatedUserBuilder.fromAccessPayload(payload)
  }
}
