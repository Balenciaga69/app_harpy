/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
export class JwtExtractorFactory {
  static createAccessTokenExtractor() {
    return ExtractJwt.fromExtractors([
      (req: Request) => (req?.cookies?.accessToken as string) ?? null,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ])
  }
  static createRefreshTokenExtractor() {
    return ExtractJwt.fromExtractors([
      (req: Request) => (req?.cookies?.refreshToken as string) ?? null,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ])
  }
}
