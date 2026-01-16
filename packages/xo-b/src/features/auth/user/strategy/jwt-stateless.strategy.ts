/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtAccessPayload } from '../../contracts'
import { AuthenticatedUser } from '../model/authenticated-user'

@Injectable()
export class JwtStatelessStrategy extends PassportStrategy(Strategy, 'jwt-stateless') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error(
        '[JWT_SECRET] environment variable is required for JwtStatelessStrategy. ' +
          'Please set JWT_SECRET in your .env file or environment variables.'
      )
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.accessToken as string) ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  validate(payload: JwtAccessPayload): AuthenticatedUser {
    // 只驗證 Access Token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }

    // 純驗證簽章與過期時間，不查任何外部狀態（Redis/DB）
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
      deviceId: payload.deviceId,
      exp: payload.exp,
    }
  }
}
