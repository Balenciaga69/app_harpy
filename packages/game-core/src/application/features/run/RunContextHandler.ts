import { Run } from '../../../domain/run/Run'
import { RunStatus } from '../../../domain/run/RunTypes'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RunStatusGuard } from '../../core-infrastructure/run-status/RunStatusGuard'
/**
 * Run 上下文操作處理器
 * 職責：協調 Run Context 與 Domain 聚合的轉換、驗證與提交
 * 邊界：專注於 Run 的狀態變更與事務提交
 */
export interface IRunContextHandler {
  /** 載入 Run Domain Model 由 Context */
  loadRunDomain(): Run
  /** 驗證當前 Run 狀態是否可進行指定操作 */
  validateRunStatus(expectedStatus: RunStatus | RunStatus[]): Result<void, string>
  /** 提交 Run Context 變更事務 */
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
  /**
   * 提交 Run 狀態變更
   * 僅更新 Run Context，不涉及臨時上下文修改
   */
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
