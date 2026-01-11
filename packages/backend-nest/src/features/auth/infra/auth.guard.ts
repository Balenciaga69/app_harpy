import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'
@Injectable()
export class IsAuthenticatedGuard extends PassportAuthGuard('jwt') {
  // @ts-expect-error TODO:
  override handleRequest(err: unknown, user: unknown): unknown {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('UNAUTHORIZED')
    }
    return user
  }
}
@Injectable()
export class AllowAnonymousGuard extends PassportAuthGuard('jwt') {
  // @ts-expect-error TODO:
  override handleRequest(_err: unknown, user: unknown): unknown {
    return user || null
  }
}
