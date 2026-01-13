import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
export interface JwtPayload {
  sub: string
  is_anon: boolean
  ver: number
}
@Injectable()
export class JwtTokenProvider {
  private readonly secret: string
  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required and must not be empty')
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long')
    }
    this.secret = secret
  }
  sign(payload: JwtPayload, expiresIn: jwt.SignOptions['expiresIn'] = '15m'): string {
    const token = jwt.sign(payload, this.secret, { expiresIn })
    return token // 返回一個加密的 JWT 字串
  }
  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      })
      return decoded as unknown as JwtPayload
    } catch {
      throw new UnauthorizedException('無效或過期的 Token')
    }
  }
}
