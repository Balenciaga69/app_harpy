import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { TokenBlacklistService } from '../auth/token-blacklist.service'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { IRunRepository } from './repository/run-repository'
@Injectable()
export class IsOwnRunGuard implements CanActivate {
  constructor(
    @Inject(InjectionTokens.RunRepository) private readonly runRepository: IRunRepository,
    private readonly tokenBlacklist: TokenBlacklistService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const runId = (request.params?.runId ?? '') as string
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (request.user?.userId ?? '') as string
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const authHeader = (request.headers?.authorization ?? '') as string
    // 1. 驗證必要參數
    if (!runId || !userId) {
      throw new UnauthorizedException('MISSING_RUN_OR_USER_ID')
    }
    // 2. 檢查 JWT payload 完整性 - JWT 必須包含 sub（user id）
    // 注意：這個檢查在 JWT 驗證時已經進行，但這裡再驗證一次確保完整性
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!request.user?.sub && !request.user?.userId) {
      throw new UnauthorizedException('INVALID_JWT_PAYLOAD')
    }
    // 3. 檢查 token 是否在黑名單中
    const token = authHeader.replace('Bearer ', '')
    if (token) {
      const tokenDigest = token.substring(0, Math.min(32, token.length))
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(tokenDigest)
      if (isBlacklisted) {
        throw new UnauthorizedException('TOKEN_BLACKLISTED')
      }
    }
    // 4. 驗證用戶是否擁有該 run
    const record = await this.runRepository.getRunIfOwner(runId, userId)
    if (!record) {
      throw new UnauthorizedException('RUN_NOT_OWNED_BY_USER')
    }
    return true
  }
}
