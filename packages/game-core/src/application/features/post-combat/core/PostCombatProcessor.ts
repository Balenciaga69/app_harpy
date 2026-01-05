import {
  PostCombatContext,
  PostCombatWinContext,
  PostCombatLoseContext,
} from '../../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { RewardGenerationContext } from '../reward/Reward'
import { IRewardFactory } from '../reward/RewardFactory'
import { IPostCombatContextHandler } from './PostCombatContextHandler'

export class PostCombatProcessor {
  constructor(
    private rewardFactory: IRewardFactory,
    private ctxHandler: IPostCombatContextHandler
  ) {}
  /**
   * 處理戰鬥後邏輯：根據結果執行勝利或失敗流程
   */
  public process(): Result<void> {
    const postCombatCtx = this.ctxHandler.getPostCombatContext()
    if (!postCombatCtx) {
      return Result.fail(ApplicationErrorCode.初始化_起始聖物無效) // 使用統一錯誤代碼 這邊是錯誤的 代表要新增一個錯誤代碼
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
    // 驗證當前 Run 狀態
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // 載入領域上下文
    const { character, stash } = this.ctxHandler.loadPostCombatDomainContexts()
    const rewardContext: RewardGenerationContext = {
      character,
      difficulty: postCombatCtx.combatDifficulty,
      stash,
    }
    const rewardResult = this.rewardFactory.createRewards(rewardContext.difficulty)
    if (rewardResult.isFailure) {
      return Result.fail(rewardResult.error!)
    }
    // 更新戰鬥後上下文，添加生成的獎勵
    const updatedPostCombat = {
      ...(postCombatCtx as PostCombatWinContext),
      detail: {
        ...(postCombatCtx as PostCombatWinContext).detail,
        availableRewards: rewardResult.value!,
      },
    }
    this.ctxHandler.updatePostCombatContext(updatedPostCombat)
    return Result.success(undefined)
  }
  private handleLose(postCombatCtx: PostCombatLoseContext): Result<void> {
    // 驗證當前 Run 狀態
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // if 是首領戰或無盡戰鬥，結束 Run
    if (postCombatCtx.combatDifficulty === 'BOSS' || postCombatCtx.combatDifficulty === 'ENDLESS') {
      const endResult = this.ctxHandler.endRun()
      if (endResult.isFailure) {
        return Result.fail(endResult.error!)
      }
    } else {
      // 計算新的重試次數
      const currentRetries = this.ctxHandler.getRemainingFailRetries()
      const retryCountToDeduct = (postCombatCtx as any).detail.retryCountToDeduct || 1
      const newRemainingRetries = Math.max(0, currentRetries - retryCountToDeduct)
      // 提交重試次數扣除
      this.ctxHandler.commitRetryDeductionTransaction({
        remainingFailRetries: newRemainingRetries,
      })
    }
    return Result.success(undefined)
  }
}
