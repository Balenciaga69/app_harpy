/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
export class JwtExtractorFactory {
  /**
   * 從 passport JWT 中創建 Access Token 提取器
   */
  static createAccessTokenExtractor() {
    return ExtractJwt.fromExtractors([
      (req: Request) => (req?.cookies?.accessToken as string) ?? null,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ])
  }
  /**
   * 從 passport JWT 中創建 Refresh Token 提取器
   */
  static createRefreshTokenExtractor() {
    return ExtractJwt.fromExtractors([
      (req: Request) => (req?.cookies?.refreshToken as string) ?? null,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ])
  }
}
