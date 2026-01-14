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
    const request = context.switchToHttp().getRequest()
    const runId = (request.params?.runId ?? '') as string
    const userId = (request.user?.userId ?? '') as string
    const authHeader = (request.headers?.authorization ?? '') as string
    if (!runId || !userId) {
      throw new UnauthorizedException('MISSING_RUN_OR_USER_ID')
    }
    if (!request.user?.sub && !request.user?.userId) {
      throw new UnauthorizedException('INVALID_JWT_PAYLOAD')
    }
    const token = authHeader.replace('Bearer ', '')
    if (token) {
      const tokenDigest = token.substring(0, Math.min(32, token.length))
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(tokenDigest)
      if (isBlacklisted) {
        throw new UnauthorizedException('TOKEN_BLACKLISTED')
      }
    }
    const record = await this.runRepository.getRunIfOwner(runId, userId)
    if (!record) {
      throw new UnauthorizedException('RUN_NOT_OWNED_BY_USER')
    }
    return true
  }
}
