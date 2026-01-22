import { RunStatus } from '../../../domain/run/RunTypes'
import { Result } from '../../../shared/result/Result'
import { IRunContextHandler } from './RunContextHandler'
export interface IRunService {
  advanceToNextStage(stageNumber: number): Result<void, string>
  deductRetry(): Result<void, string>
  changeRunStatus(newStatus: RunStatus): Result<void, string>
  endRun(): Result<void, string>
  addEncounteredEnemy(enemyId: string): Result<void, string>
}
export class RunService implements IRunService {
  constructor(private runContextHandler: IRunContextHandler) {}
  advanceToNextStage(stageNumber: number): Result<void, string> {
    const validateResult = this.runContextHandler.validateRunStatus('POST_COMBAT')
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    const run = this.runContextHandler.loadRunDomain()
    const advanceResult = run.advanceToNextStage(stageNumber)
    if (advanceResult.isFailure) return Result.fail(advanceResult.error!)
    const newRun = advanceResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success()
  }
  deductRetry(): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const deductResult = run.deductRetry()
    if (deductResult.isFailure) return Result.fail(deductResult.error!)
    const newRun = deductResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success()
  }
  changeRunStatus(newStatus: RunStatus): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const changeResult = run.changeStatus(newStatus)
    if (changeResult.isFailure) return Result.fail(changeResult.error!)
    const newRun = changeResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success()
  }
  endRun(): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const endResult = run.endRun()
    if (endResult.isFailure) return Result.fail(endResult.error!)
    const newRun = endResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success()
  }
  addEncounteredEnemy(enemyId: string): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const addResult = run.addEncounteredEnemy(enemyId)
    if (addResult.isFailure) return Result.fail(addResult.error!)
    const newRun = addResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success()
  }
}
