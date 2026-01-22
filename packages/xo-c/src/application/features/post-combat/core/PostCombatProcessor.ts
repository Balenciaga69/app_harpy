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
  public process(): Result<void> {
    const postCombatContext = this.contextAccessor.getPostCombatContext()
    if (!postCombatContext) {
      return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
    }
    if (postCombatContext.result === 'WIN') {
      return this.handleWin(postCombatContext)
    }
    if (postCombatContext.result === 'LOSE') {
      return this.handleLose(postCombatContext)
    }
    return Result.success()
  }
  private handleWin(postCombatContext: PostCombatContext): Result<void> {
    const character = this.postCombatDomainConverter.convertCharacterContextToDomain()
    const stash = this.postCombatDomainConverter.convertStashContextToDomain()
    const rewardContext: RewardGenerationContext = {
      character,
      difficulty: postCombatContext.combatDifficulty,
      stash,
    }
    const rewardResult = this.rewardFactory.createRewards(rewardContext.difficulty)
    if (rewardResult.isFailure) {
      return Result.fail(rewardResult.error!)
    }
    const updatedPostCombat = {
      ...(postCombatContext as PostCombatWinContext),
      detail: {
        ...(postCombatContext as PostCombatWinContext).detail,
        availableRewards: rewardResult.value!,
      },
    }
    this.transactionManager.updatePostCombatContext(updatedPostCombat)
    return Result.success()
  }
  private handleLose(postCombatContext: PostCombatLoseContext): Result<void> {
    if (postCombatContext.combatDifficulty === 'BOSS' || postCombatContext.combatDifficulty === 'ENDLESS') {} else {
      const currentRetries = this.contextAccessor.getRemainingFailRetries()
      const retryCountToDeduct = postCombatContext.detail.retryCountToDeduct || 1
      const newRemainingRetries = Math.max(0, currentRetries - retryCountToDeduct)
      this.transactionManager.commitRetryDeduction(newRemainingRetries)
    }
    return Result.success()
  }
}
