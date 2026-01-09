import { Result } from '../../../../shared/result/Result'
import { IRunContextHandler } from '../RunContextHandler'
import { IStageInitializationService } from '../stage-progression/service/StageInitializationService'
export interface IRunCoordinationService {
  advanceToNextStageAndInitialize(stageNumber: number): Result<void, string>
}
export class RunCoordinationService implements IRunCoordinationService {
  constructor(
    private runContextHandler: IRunContextHandler,
    private stageInitializationService: IStageInitializationService
  ) {}
  advanceToNextStageAndInitialize(stageNumber: number): Result<void, string> {
    const validateResult = this.runContextHandler.validateRunStatus('POST_COMBAT')
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    const run = this.runContextHandler.loadRunDomain()
    const advanceResult = run.advanceToNextStage(stageNumber)
    if (advanceResult.isFailure) return Result.fail(advanceResult.error!)
    const newRun = advanceResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    const initResult = this.stageInitializationService.initializeStage(stageNumber)
    if (initResult.isFailure) return Result.fail(initResult.error!)
    return Result.success(undefined)
  }
}
