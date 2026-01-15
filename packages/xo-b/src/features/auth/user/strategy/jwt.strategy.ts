/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { RedisAccessTokenRepository } from '../../token/access-token.repository'
import { AuthenticatedUser } from '../model/authenticated-user'
interface JwtPayload {
  sub: string
  username: string
  jti: string
  type: 'access' | 'refresh'
  deviceId?: string
  iat?: number
  exp?: number
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly accessTokenRepository: RedisAccessTokenRepository
  ) {
    const secret = configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error(
        '[JWT_SECRET] environment variable is required for JwtStrategy. ' +
          'Please set JWT_SECRET in your .env file or environment variables.'
      )
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // 只驗證 Access Token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }
    // 檢查是否被黑名單（按 jti）
    const isBlacklistedByJti = await this.accessTokenRepository.isBlacklistedByJti(payload.jti)
    if (isBlacklistedByJti) {
      throw new UnauthorizedException('Token has been revoked')
    }
    // 檢查該裝置是否被登出
    if (payload.deviceId) {
      const isDeviceBlacklisted = await this.accessTokenRepository.isBlacklistedByDeviceId(
        payload.sub,
        payload.deviceId
      )
      if (isDeviceBlacklisted) {
        throw new UnauthorizedException('Device session has been terminated')
      }
    }
    return {
      userId: payload.sub,
      username: payload.username,
      jti: payload.jti,
      deviceId: payload.deviceId,
    }
  }
}
