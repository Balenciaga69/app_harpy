import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GuestService } from './guest.service'
@Injectable()
export class GuestOrUserGuard implements CanActivate {
  constructor(private readonly guestService: GuestService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
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
    request.guest = { guestId: session.guestId }
    return true
  }
  private extractGuestId(request: any): string | null {
    const guestId = request.headers['x-guest-id']
    if (guestId) {
      return guestId
    }
    return request.query.guestId || null
  }
}
