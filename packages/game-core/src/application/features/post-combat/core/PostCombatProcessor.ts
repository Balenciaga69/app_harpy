import {
  PostCombatContext,
  PostCombatLoseContext,
  PostCombatWinContext,
} from '../../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { RewardGenerationContext } from '../reward/Reward'
import { IRewardFactory } from '../reward/RewardFactory'
import { IPostCombatContextAccessor } from './PostCombatContextAccessor'
import { IPostCombatDomainConverter } from './PostCombatDomainConverter'
import { IPostCombatTransactionManager } from './PostCombatTransactionManager'
export class PostCombatProcessor {
  constructor(
    private rewardFactory: IRewardFactory,
    private contextAccessor: IPostCombatContextAccessor,
    private postCombatDomainConverter: IPostCombatDomainConverter,
    private transactionManager: IPostCombatTransactionManager
  ) {}
  /**
   * 處理戰鬥後邏輯：根據結果執行勝利或失敗流程
   */
  public process(): Result<void> {
    const postCombatCtx = this.contextAccessor.getPostCombatContext()
    if (!postCombatCtx) {
      return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
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
    const character = this.postCombatDomainConverter.convertCharacterContextToDomain()
    const stash = this.postCombatDomainConverter.convertStashContextToDomain()
    const rewardContext: RewardGenerationContext = {
      character,
      difficulty: postCombatCtx.combatDifficulty,
      stash,
    }
    const rewardResult = this.rewardFactory.createRewards(rewardContext.difficulty)
    if (rewardResult.isFailure) {
      return Result.fail(rewardResult.error!)
    }

    const updatedPostCombat = {
      ...(postCombatCtx as PostCombatWinContext),
      detail: {
        ...(postCombatCtx as PostCombatWinContext).detail,
        availableRewards: rewardResult.value!,
      },
    }
    this.transactionManager.updatePostCombatContext(updatedPostCombat)
    return Result.success(undefined)
  }
  private handleLose(postCombatCtx: PostCombatLoseContext): Result<void> {
    if (postCombatCtx.combatDifficulty === 'BOSS' || postCombatCtx.combatDifficulty === 'ENDLESS') {
    } else {
      const currentRetries = this.contextAccessor.getRemainingFailRetries()
      const retryCountToDeduct = postCombatCtx.detail.retryCountToDeduct || 1
      const newRemainingRetries = Math.max(0, currentRetries - retryCountToDeduct)

      this.transactionManager.commitRetryDeduction(newRemainingRetries)
    }
    return Result.success(undefined)
  }
}
