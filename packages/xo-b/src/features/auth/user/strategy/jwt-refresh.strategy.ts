/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { IRefreshTokenRepository, JwtRefreshPayload } from '../../contracts'
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    readonly configService: ConfigService,
    @Inject(InjectionTokens.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {
    const secret = configService.get<string>('JWT_SECRET')
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.refreshToken as string) ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }
  async validate(payload: JwtRefreshPayload) {
    // 驗證 Token 類型
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for refresh')
    }
    // 檢查 Refresh Token 是否被黑名單
    const isBlacklisted = await this.refreshTokenRepository.isBlacklisted(payload.jti)
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token has been revoked')
    }
    // 檢查資料庫中是否存在該紀錄 (確保沒被刪除)
    const record = await this.refreshTokenRepository.findByJti(payload.jti)
    if (!record) {
      throw new UnauthorizedException('Refresh token not found')
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
