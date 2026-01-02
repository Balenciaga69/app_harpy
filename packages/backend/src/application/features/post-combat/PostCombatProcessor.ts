import { PostCombatContext, PostCombatWinContext } from '../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RewardGenerationContext } from './reward/Reward'
import { IRewardFactory } from './reward/RewardFactory'

/**
 * 戰鬥後處理器：協調勝利/失敗邏輯，確保交易原子性
 * 職責：檢查戰鬥結果，生成獎勵並更新上下文
 * 邊界：不直接操作 DB，通過 unitOfWork 提交
 */
export class PostCombatProcessor {
  constructor(
    private rewardFactory: IRewardFactory,
    private contextAccessor: IContextSnapshotAccessor,
    private contextUnitOfWork: IContextUnitOfWork,
    private contextToDomainConverter: IContextToDomainConverter
  ) {}

  /**
   * 處理戰鬥後邏輯：根據結果執行勝利或失敗流程
   */
  public process(): Result<void> {
    const postCombatCtx = this.contextAccessor.getRunContext().temporaryContext?.postCombat
    if (!postCombatCtx) {
      return Result.fail(ApplicationErrorCode.初始化_起始聖物無效) // 使用統一錯誤代碼
    }

    if (postCombatCtx.result === 'WIN') {
      return this.handleWin(postCombatCtx)
    }
    if (postCombatCtx.result === 'LOSE') {
      return this.handleLose(postCombatCtx)
    }

    return Result.success(undefined)
  }

  /**
   * 處理勝利邏輯：生成獎勵並更新上下文（不可變方式）
   */
  private handleWin(postCombatCtx: PostCombatContext): Result<void> {
    const rewardContext: RewardGenerationContext = {
      character: this.contextToDomainConverter.convertCharacterContextToDomain(),
      difficulty: postCombatCtx.combatDifficulty,
      stash: this.contextToDomainConverter.convertStashContextToDomain(),
    }

    const rewardResult = this.rewardFactory.createRewards(rewardContext.difficulty)
    if (rewardResult.isFailure) {
      return Result.fail(rewardResult.error!)
    }

    // 不可變更新：創建新物件，避免突變
    const currentRunContext = this.contextAccessor.getRunContext()
    const updatedTemporaryContext = {
      ...currentRunContext.temporaryContext,
      postCombat: {
        ...(currentRunContext.temporaryContext!.postCombat as PostCombatWinContext),
        detail: {
          ...(currentRunContext.temporaryContext!.postCombat as PostCombatWinContext).detail,
          availableRewards: rewardResult.value!,
        },
      },
    }

    const updatedRunContext = {
      ...currentRunContext,
      temporaryContext: updatedTemporaryContext,
    }

    this.contextUnitOfWork.updateRunContext(updatedRunContext)
    // DB 提交通過 unitOfWork 處理，無直接副作用

    return Result.success(undefined)
  }

  /**
   * 處理失敗邏輯：扣除重試次數或觸發死亡（待實作）
   */
  private handleLose(postCombatCtx: PostCombatContext): Result<void> {
    // TODO: 實作扣除重試或死亡邏輯
    return Result.success(undefined)
  }
}
