import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GuestService } from './guest.service'

@Injectable()
export class GuestOrUserGuard implements CanActivate {
  constructor(private readonly guestService: GuestService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (request.user) {
      return true
    }
    const guestId = this.extractGuestId(request)
    if (!guestId) {
      throw new UnauthorizedException('需要提供有效的 User Token 或 Guest ID')
    }
    const session = await this.guestService.validateGuestId(guestId)
    if (!session) {
      throw new UnauthorizedException('Guest ID 已過期或不存在')
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    request.guest = { guestId: session.guestId }
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractGuestId(request: any): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const guestId = request.headers?.['x-guest-id']
    if (guestId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return guestId
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return request.query?.guestId || null
  }
}
