import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenBlacklistService } from './token-blacklist.service'
@Injectable()
/** 必須有 user 才能通過，且 token 不在黑名單中 */
export class IsAuthenticatedGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly tokenBlacklist: TokenBlacklistService) {
    super()
  }
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    // 先執行 JWT 驗證
    const canActivate = await super.canActivate(context)
    if (!canActivate) {
      return false
    }
    // 檢查 token 是否在黑名單中
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('UNAUTHORIZED')
    }
    return user
  }
  /**
   * 生成 token 的摘要用於黑名單檢查
   * 使用 token 前 32 字符作為摘要（足以識別但不洩露完整 token）
   */
  private generateTokenDigest(token: string): string {
    return token.substring(0, Math.min(32, token.length))
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
