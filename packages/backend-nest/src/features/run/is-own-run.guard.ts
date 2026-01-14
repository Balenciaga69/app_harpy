/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { IRunRepository } from './repository/run-repository'
@Injectable()
export class IsOwnRunGuard implements CanActivate {
  constructor(@Inject(InjectionTokens.RunRepository) private readonly runRepository: IRunRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const runId = (request.params?.runId ?? '') as string
    const userId = (request.user?.userId ?? '') as string
    if (!runId || !userId) {
      throw new UnauthorizedException('MISSING_RUN_OR_USER_ID')
    }
    if (!request.user?.sub && !request.user?.userId) {
      throw new UnauthorizedException('INVALID_JWT_PAYLOAD')
    }
    const record = await this.runRepository.getRunIfOwner(runId, userId)
    if (!record) {
      throw new UnauthorizedException('RUN_NOT_OWNED_BY_USER')
    }
    return true
  }
}
