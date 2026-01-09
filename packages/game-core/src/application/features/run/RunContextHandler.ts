import { Run } from '../../../domain/run/Run'
import { RunStatus } from '../../../domain/run/RunTypes'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RunStatusGuard } from '../../core-infrastructure/run-status/RunStatusGuard'
export interface IRunContextHandler {
  loadRunDomain(): Run
  validateRunStatus(expectedStatus: RunStatus | RunStatus[]): Result<void, string>
  commitRunChanges(run: Run): void
}
export class RunContextHandler implements IRunContextHandler {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter,
    private unitOfWork: IContextUnitOfWork
  ) {}
  loadRunDomain(): Run {
    return this.contextToDomainConverter.convertRunContextToDomain()
  }
  validateRunStatus(expectedStatus: RunStatus | RunStatus[]): Result<void, string> {
    const status = this.contextAccessor.getRunStatus()
    return RunStatusGuard.requireStatus(status, expectedStatus)
  }
  commitRunChanges(run: Run): void {
    this.unitOfWork.patchRunContext({
      seed: run.seed,
      currentChapter: run.currentChapter,
      currentStage: run.currentStage,
      encounteredEnemyIds: run.encounteredEnemyIds,
      chapters: run.chapters,
      rollModifiers: run.rollModifiers,
      remainingFailRetries: run.remainingFailRetries,
      status: run.status,
    })
    this.unitOfWork.commit()
  }
}
