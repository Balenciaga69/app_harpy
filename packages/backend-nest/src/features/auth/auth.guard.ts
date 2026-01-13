import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
@Injectable()
/** 必須有 user 才能通過 */
export class IsAuthenticatedGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('UNAUTHORIZED')
    }
    return user
  }
}
@Injectable()
/** 如果沒 user 也允許通過 */
export class AllowAnonymousGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(_err: unknown, user: unknown): any {
    return user ?? null
  }
}
