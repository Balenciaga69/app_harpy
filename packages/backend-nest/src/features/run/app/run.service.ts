import { Inject, Injectable } from '@nestjs/common'
import { RunInitializationService } from 'src/from-game-core'
import { InjectionTokens } from '../../../infra/providers/injection-tokens'
import type { CreateRunRecordParams } from '../domain/run-record'
import type { IRunRepository } from './run-repository'
@Injectable()
export class RunService {
  constructor(
    private readonly runInitializationService: RunInitializationService,
    @Inject(InjectionTokens.RunRepository) private readonly runRepository: IRunRepository
  ) {}
  async initializeRunForUser(
    userId: string,
    params: { professionId: string; seed?: number; startingRelicIds?: string[] }
  ) {
    const result = await this.runInitializationService.initialize({
      professionId: params.professionId,
      seed: params.seed,
      startingRelicIds: params.startingRelicIds,
    })
    if (result.isFailure) {
      return result
    }
    const appContext = result.value!
    const runId = appContext.contexts.runContext.runId
    const runRecord: CreateRunRecordParams = {
      runId,
      userId,
    }
    await this.runRepository.createRunRecord(runRecord)
    return result
  }
  async verifyRunOwnership(runId: string, userId: string): Promise<boolean> {
    const record = await this.runRepository.getRunIfOwner(runId, userId)
    return record !== null
  }
  async getUserRuns(userId: string) {
    return this.runRepository.getRunsByUserId(userId)
  }
  async getUserActiveRun(userId: string) {
    return this.runRepository.getActiveRunByUserId(userId)
  }
}
