import { Character } from '../../../../domain/character/Character'
import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { Stash } from '../../../../domain/stash/Stash'
import { Result } from '../../../../shared/result/Result'
import { IContextSnapshotAccessor } from '../../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../../core-infrastructure/context/service/ContextUnitOfWork'
/**
 * 戰鬥後事務管理器
 * 職責：所有的事務提交操作，確保上下文與領域狀態一致性
 */
export interface IPostCombatTransactionManager {
  commitRewardSelection(updates: { character: Character; stash: Stash }): Result<void>
  commitRetryDeduction(remainingFailRetries: number): Result<void>
  updatePostCombatContext(updatedPostCombat: PostCombatContext): Result<void>
  commitClaimRewardsAndAdvance(updates: {
    character: Character
    stash: Stash
    postCombatContext: PostCombatContext
  }): Result<void>
}
export class PostCombatTransactionManager implements IPostCombatTransactionManager {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private unitOfWork: IContextUnitOfWork
  ) {}
  /** 提交獎勵選擇變更 */
  public commitRewardSelection(updates: { character: Character; stash: Stash }): Result<void> {
    this.unitOfWork
      .patchCharacterContext({
        ...updates.character.record,
      })
      .patchStashContext({
        items: updates.stash.listItems().map((i) => i.record),
      })
      .commit()
    return Result.success(undefined)
  }
  /** 提交重試次數扣除 */
  public commitRetryDeduction(remainingFailRetries: number): Result<void> {
    this.unitOfWork
      .patchRunContext({
        remainingFailRetries,
      })
      .commit()
    return Result.success(undefined)
  }
  /** 更新戰鬥後上下文 */
  public updatePostCombatContext(updatedPostCombat: PostCombatContext): Result<void> {
    const currentRunContext = this.contextAccessor.getRunContext()
    const updatedRunContext = {
      ...currentRunContext,
      temporaryContext: {
        ...currentRunContext.temporaryContext,
        postCombat: updatedPostCombat,
      },
    }
    this.unitOfWork.updateRunContext(updatedRunContext).commit()
    return Result.success(undefined)
  }
  /** 原子性提交領獎與推進 */
  public commitClaimRewardsAndAdvance(updates: {
    character: Character
    stash: Stash
    postCombatContext: PostCombatContext
  }): Result<void> {
    this.unitOfWork
      .patchCharacterContext({
        ...updates.character.record,
      })
      .patchStashContext({
        items: updates.stash.listItems().map((item) => item.record),
      })
      .patchRunContext({
        temporaryContext: {
          postCombat: updates.postCombatContext,
        },
      })
      .commit()
    return Result.success(undefined)
  }
}
