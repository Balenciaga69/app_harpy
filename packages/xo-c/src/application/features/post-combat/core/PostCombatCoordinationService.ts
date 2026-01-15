import { Result } from '../../../../shared/result/Result'
import { IRunService } from '../../run/RunService'
import { IPostCombatContextHandler } from './PostCombatContextHandler'
export interface IPostCombatCoordinationService {
  claimRewardsAndAdvance(params: { selectedRewardIndexes: number[]; nextStageNumber: number }): Result<void, string>
}
export class PostCombatCoordinationService implements IPostCombatCoordinationService {
  constructor(
    private postCombatContextHandler: IPostCombatContextHandler,
    private runService: IRunService
  ) {}
  claimRewardsAndAdvance(params: { selectedRewardIndexes: number[]; nextStageNumber: number }): Result<void, string> {
    const validateStatus = this.postCombatContextHandler.validateRunStatus()
    if (validateStatus.isFailure) return Result.fail(validateStatus.error!)
    const validateReward = this.postCombatContextHandler.validateRewardSelection(params.selectedRewardIndexes)
    if (validateReward.isFailure) return Result.fail(validateReward.error!)
    const { character, stash } = this.postCombatContextHandler.loadPostCombatDomainContexts()
    const applyRewardResult = this.postCombatContextHandler.applyRewardsToCharacterAndStash(
      character,
      stash,
      params.selectedRewardIndexes
    )
    if (applyRewardResult.isFailure) return Result.fail(applyRewardResult.error!)
    const { updatedCharacter, updatedStash } = applyRewardResult.value!
    const commitResult = this.postCombatContextHandler.commitClaimRewardsAndAdvance({
      updatedCharacter,
      updatedStash,
      selectedRewardIndexes: params.selectedRewardIndexes,
    })
    if (commitResult.isFailure) return Result.fail(commitResult.error!)
    const advanceResult = this.runService.advanceToNextStage(params.nextStageNumber)
    if (advanceResult.isFailure) return Result.fail(advanceResult.error!)
    return Result.success(undefined)
  }
}
