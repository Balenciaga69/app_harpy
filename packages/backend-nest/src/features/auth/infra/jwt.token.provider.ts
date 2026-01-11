import { Injectable } from '@nestjs/common'
import { sign, verify } from 'jsonwebtoken'
export interface JwtPayload {
  sub: string
  is_anon: boolean
  ver: number
}
@Injectable()
export class JwtTokenProvider {
  private readonly secret = process.env.JWT_SECRET || 'dev-secret-key'
  sign(payload: JwtPayload, options?: { expiresIn?: string }): string {
    const token = (sign as unknown as (payload: JwtPayload, secret: string, options: unknown) => string)(
      payload,
      this.secret,
      { expiresIn: options?.expiresIn || '15m' }
    )
    return token
  }
  verify(token: string): JwtPayload {
    const decoded = (verify as unknown as (token: string, secret: string) => unknown)(token, this.secret)
    return (decoded && typeof decoded === 'object' ? decoded : {}) as JwtPayload
  }
}
