import { PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { CharacterAggregate } from '../../../domain/character/Character'
import { Stash } from '../../../domain/stash/Stash'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RunStatusGuard } from '../../core-infrastructure/run-status/RunStatusGuard'
export interface IPostCombatContextHandler {
  getPostCombatContext(): PostCombatContext | undefined
  getRemainingFailRetries(): number
  loadPostCombatDomainContexts(): {
    character: CharacterAggregate
    stash: Stash
  }
  validateRunStatus(): Result<void, string>
  updatePostCombatContext(updatedPostCombat: PostCombatContext): Result<void>
  commitRewardSelectionTransaction(updates: { characterRecord?: any; stash?: Stash }): Result<void>
  commitRetryDeductionTransaction(updates: { remainingFailRetries: number }): Result<void>
}
export class PostCombatContextHandler implements IPostCombatContextHandler {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter,
    private unitOfWork: IContextUnitOfWork
  ) {}
  /** 獲取戰鬥後上下文 */
  public getPostCombatContext(): PostCombatContext | undefined {
    return this.contextAccessor.getRunContext().temporaryContext?.postCombat
  }
  /** 獲取剩餘重試次數 */
  public getRemainingFailRetries(): number {
    return this.contextAccessor.getRunContext().remainingFailRetries
  }
  /** 載入戰鬥後相關的領域上下文 */
  public loadPostCombatDomainContexts() {
    return {
      character: this.contextToDomainConverter.convertCharacterContextToDomain(),
      stash: this.contextToDomainConverter.convertStashContextToDomain(),
    }
  }
  /** 驗證當前 Run 狀態是否為 POST_COMBAT */
  public validateRunStatus() {
    const status = this.contextAccessor.getRunStatus()
    return RunStatusGuard.requireStatus(status, 'POST_COMBAT')
  }
  /** 提交獎勵選擇交易事務 */
  public commitRewardSelectionTransaction(updates: { characterRecord?: any; stash?: Stash }) {
    if (updates.characterRecord) {
      this.unitOfWork.patchCharacterContext({
        ...updates.characterRecord,
      })
    }
    if (updates.stash) {
      this.unitOfWork.patchStashContext({
        items: updates.stash.listItems().map((i) => i.record),
      })
    }
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
  /** 更新戰鬥後上下文 */
  public updatePostCombatContext(updatedPostCombat: PostCombatContext) {
    const currentRunContext = this.contextAccessor.getRunContext()
    const updatedRunContext = {
      ...currentRunContext,
      temporaryContext: {
        ...currentRunContext.temporaryContext,
        postCombat: updatedPostCombat,
      },
    }
    this.unitOfWork.updateRunContext(updatedRunContext)
    return Result.success(undefined)
  }
  /** 提交重試次數扣除交易事務 */
  public commitRetryDeductionTransaction(updates: { remainingFailRetries: number }) {
    this.unitOfWork.patchRunContext({
      remainingFailRetries: updates.remainingFailRetries,
    })
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
}
