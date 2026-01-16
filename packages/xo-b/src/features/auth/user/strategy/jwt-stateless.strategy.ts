import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { JwtAccessPayload } from '../../contracts'
import { AuthenticatedUserBuilder } from '../helpers/authenticated-user.builder'
import { JwtConfigHelper } from '../helpers/jwt-config.helper'
import { JwtExtractorFactory } from '../helpers/jwt-extractor.factory'
import { JwtValidator } from '../helpers/jwt-validator.helper'
import { AuthenticatedUser } from '../model/authenticated-user'
@Injectable()
export class JwtStatelessStrategy extends PassportStrategy(Strategy, 'jwt-stateless') {
  constructor(configService: ConfigService) {
    const secret = JwtConfigHelper.getValidatedSecret(configService, 'JwtStatelessStrategy')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest: JwtExtractorFactory.createAccessTokenExtractor(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }
  validate(payload: JwtAccessPayload): AuthenticatedUser {
    // 驗證 Token 類型
    JwtValidator.validateAccessTokenType(payload)
    // 純驗證簽章與過期時間，不查任何外部狀態（Redis/DB）
    return AuthenticatedUserBuilder.fromAccessPayload(payload)
  }
}
