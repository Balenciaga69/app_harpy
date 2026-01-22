/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
export const JwtExtractorFactory = {
  /**
   * 從 passport JWT 中創建 Access Token 提取器
   */
  createAccessTokenExtractor() {
    return ExtractJwt.fromExtractors([
      (request: Request) => (request?.cookies?.accessToken as string) ?? null,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ])
  },
  /**
   * 從 passport JWT 中創建 Refresh Token 提取器
   */
  createRefreshTokenExtractor() {
    return ExtractJwt.fromExtractors([
      (request: Request) => (request?.cookies?.refreshToken as string) ?? null,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ])
  },
}
