import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenBlacklistService } from './token-blacklist.service'
@Injectable()
export class IsAuthenticatedGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly tokenBlacklist: TokenBlacklistService) {
    super()
  }
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context)
    if (!canActivate) {
      return false
    }
    const request = context.switchToHttp().getRequest()
    const authHeader = (request.headers?.authorization ?? '') as string
    const token = authHeader.replace('Bearer ', '')
    if (token) {
      const tokenDigest = this.generateTokenDigest(token)
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(tokenDigest)
      if (isBlacklisted) {
        throw new UnauthorizedException('TOKEN_BLACKLISTED')
      }
    }
    return true
  }
  override handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('UNAUTHORIZED')
    }
    return user
  }
  private generateTokenDigest(token: string): string {
    return token.substring(0, Math.min(32, token.length))
  }
}
@Injectable()
export class AllowAnonymousGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(_err: unknown, user: unknown): any {
    return user ?? null
  }
}
