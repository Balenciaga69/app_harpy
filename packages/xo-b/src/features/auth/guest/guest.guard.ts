/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GuestService } from './guest.service'
@Injectable()
export class GuestOrUserGuard implements CanActivate {
  constructor(private readonly guestService: GuestService) {}
  /** Determine whether it is a verified user or a guest */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Check if it is a validated user
    const request = context.switchToHttp().getRequest()
    if (request.user) {
      return true
    }
    //Check if it is a validated guest
    const guestId = this.extractGuestId(request)
    if (!guestId) {
      throw new UnauthorizedException('需要提供有效的 User Token 或 Guest ID')
    }
    const session = await this.guestService.validateGuestId(guestId)
    if (!session) {
      throw new UnauthorizedException('Guest ID 已過期或不存在')
    }
    request.guest = { guestId: session.guestId }
    return true
  }
  /** Extract guestId from headers or query parameters */
  private extractGuestId(request: any): string | null {
    const guestId = request.headers?.['x-guest-id']
    if (guestId) {
      return guestId
    }
    return request.query?.guestId || null
  }
}
