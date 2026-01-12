import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
export interface JwtPayload {
  sub: string
  is_anon: boolean
  ver: number
}
@Injectable()
export class JwtTokenProvider {
  private readonly secret = process.env.JWT_SECRET || 'dev-secret-key'
  sign(payload: JwtPayload, expiresIn: jwt.SignOptions['expiresIn'] = '15m'): string {
    const token = jwt.sign(payload, this.secret, { expiresIn })
    return token
  }
  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret)
      return decoded as unknown as JwtPayload
    } catch {
      throw new UnauthorizedException('無效或過期的 Token')
    }
  }
}
