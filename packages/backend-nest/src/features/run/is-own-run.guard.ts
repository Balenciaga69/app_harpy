import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { IRunRepository } from './repository/run-repository'
@Injectable()
export class IsOwnRunGuard implements CanActivate {
  constructor(@Inject(InjectionTokens.RunRepository) private readonly runRepository: IRunRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest()
    const runId = (request as unknown as { params?: { runId?: string } }).params?.runId
    const userId = (request as unknown as { user?: { userId?: string } }).user?.userId
    if (!runId || !userId) {
      throw new UnauthorizedException('MISSING_RUN_OR_USER_ID')
    }
    const record = await this.runRepository.getRunIfOwner(runId, userId)
    if (!record) {
      throw new UnauthorizedException('RUN_NOT_OWNED_BY_USER')
    }
    return true
  }
}
