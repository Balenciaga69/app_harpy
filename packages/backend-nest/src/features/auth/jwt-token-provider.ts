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
    this.secret = this.configService.get<string>('JWT_SECRET', 'dev-secret-key')
  }
  sign(payload: JwtPayload, expiresIn: jwt.SignOptions['expiresIn'] = '15m'): string {
    const token = jwt.sign(payload, this.secret, { expiresIn })
    return token // 返回一個加密的 JWT 字串
  }
  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret)
      return decoded as unknown as JwtPayload // 返回解碼後的 payload
    } catch {
      throw new UnauthorizedException('無效或過期的 Token')
    }
  }
}
