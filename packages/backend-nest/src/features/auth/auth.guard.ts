import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'
@Injectable()
export class IsAuthenticatedGuard extends PassportAuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('UNAUTHORIZED')
    }
    return user
  }
}
@Injectable()
export class AllowAnonymousGuard extends PassportAuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(_err: unknown, user: unknown): any {
    return user ?? null
  }
}
