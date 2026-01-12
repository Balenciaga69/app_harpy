import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import type { JwtPayload } from './jwt-token-provider'
export interface AuthenticatedUser {
  userId: string
  isAnonymous: boolean
  version: number
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: (req: unknown): string | null => {
        const request = req as { headers?: { authorization?: string } }
        const authHeader = request.headers?.authorization
        if (!authHeader?.startsWith('Bearer ')) return null
        return authHeader.substring(7)
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-key',
    })
  }
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      isAnonymous: payload.is_anon,
      version: payload.ver,
    }
  }
}
