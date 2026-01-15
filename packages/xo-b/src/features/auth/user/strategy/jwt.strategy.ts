/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthenticatedUser } from '../model/authenticated-user.ts'
interface JwtPayload {
  sub: string
  username: string
  jti: string
  iat?: number
  exp?: number
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // FIXME: @Copilot Refactor this to use NestJS ConfigService instead of process.env.
      // Ensure no fallback/default values are used for the secret key
      secretOrKey: process.env.JWT_SECRET || 'yourkey',
    })
  }
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
    }
  }
}
