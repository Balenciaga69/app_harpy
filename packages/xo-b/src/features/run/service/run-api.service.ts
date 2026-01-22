import { Inject, Injectable } from '@nestjs/common'
import { RunInitializationService } from 'src/from-xo-c'

import { InjectionTokens } from '../../shared/providers/injection-tokens'
import { CreateRunRecordParams as CreateRunRecordParameters } from '../model/run-record'
import type { IRunRepository } from '../repository/run-repository'
type InitializeRunForUserParameters = {
  professionId: string
  seed?: number
  startingRelicIds?: string[]
}
@Injectable()
export class RunApiService {
  constructor(
    private readonly runInitializationService: RunInitializationService,
    @Inject(InjectionTokens.RunRepository) private readonly runRepository: IRunRepository
  ) {}
  async initializeRunForUser(userId: string, parameters: InitializeRunForUserParameters) {
    const result = await this.runInitializationService.initialize({
      professionId: parameters.professionId,
      seed: parameters.seed,
      startingRelicIds: parameters.startingRelicIds,
    })
    if (result.isFailure) return result
    const appContext = result.value!
    const runId = appContext.contexts.runContext.runId
    const runRecord: CreateRunRecordParameters = {
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
