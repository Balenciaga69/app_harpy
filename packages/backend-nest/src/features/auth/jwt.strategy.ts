import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import type { JwtPayload } from './auth.service'

export interface AuthenticatedUser {
  userId: string
  isAnonymous: boolean
  version: number
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required')
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      /** 從 header 取 token */
      jwtFromRequest: (req: unknown): string | null => {
        const request = req as { headers?: { authorization?: string } }
        const authHeader = request.headers?.authorization
        if (!authHeader?.startsWith('Bearer ')) return null
        return authHeader.substring(7)
      },
      ignoreExpiration: false,
      secretOrKey: secret,
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
