import { Character } from '../../../domain/character/Character'
import { ItemRecord } from '../../../domain/item/Item'
import { CombatReward, PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { Stash } from '../../../domain/stash/Stash'
import { DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { ItemEntityService } from '../../content-generation/service/item/ItemEntityService'
import { IRunService } from '../run/RunService'
import { IPostCombatContextAccessor } from './core/PostCombatContextAccessor'
import { IPostCombatDomainConverter } from './core/PostCombatDomainConverter'
import { IPostCombatTransactionManager } from './core/PostCombatTransactionManager'
import { IPostCombatValidator } from './core/PostCombatValidator'
export interface RewardApplicationResult {
  readonly updatedCharacter: Character
  readonly updatedStash: Stash
}
export interface IPostCombatContextHandler {
  loadPostCombatDomainContexts(): {
    character: Character
    stash: Stash
  }
  endRun(): Result<void>
  validateRunStatus(): Result<void, string>
  validateRewardSelection(selectedIndexes: number[]): Result<void>
  applyRewardsToCharacterAndStash(
    character: Character,
    stash: Stash,
    selectedIndexes: number[]
  ): Result<RewardApplicationResult>
  commitClaimRewardsAndAdvance(parameters: {
    updatedCharacter: Character
    updatedStash: Stash
    selectedRewardIndexes: number[]
  }): Result<void>
}
export class PostCombatContextHandler implements IPostCombatContextHandler {
  constructor(
    private accessor: IPostCombatContextAccessor,
    private validator: IPostCombatValidator,
    private converter: IPostCombatDomainConverter,
    private transactionManager: IPostCombatTransactionManager,
    private itemEntityService: ItemEntityService,
    private runService: IRunService
  ) {}
  public loadPostCombatDomainContexts() {
    return {
      character: this.converter.convertCharacterContextToDomain(),
      stash: this.converter.convertStashContextToDomain(),
    }
  }
  public validateRunStatus(): Result<void, string> {
    return this.validator.validateRunStatus()
  }
  public validateRewardSelection(selectedIndexes: number[]): Result<void, string> {
    return this.validator.validateRewardSelection(selectedIndexes)
  }
  public applyRewardsToCharacterAndStash(
    character: Character,
    stash: Stash,
    selectedIndexes: number[]
  ): Result<RewardApplicationResult> {
    const postCombatContext = this.accessor.getPostCombatContext()
    if (!postCombatContext || postCombatContext.result !== 'WIN') {
      return Result.fail(DomainErrorCode.PostCombat_非勝利狀態)
    }
    const availableRewards = postCombatContext.detail.availableRewards
    const applyRewardResult = selectedIndexes.reduce(
      (accumulatorResult, selectedIndex) => {
        if (accumulatorResult.isFailure) {
          return accumulatorResult
        }
        const accumulated: RewardApplicationResult = accumulatorResult.value!
        const reward: CombatReward = availableRewards[selectedIndex]
        if (!reward) {
          return Result.fail<RewardApplicationResult>(DomainErrorCode.PostCombat_無效獎勵索引)
        }
        let updatedCharacter = accumulated.updatedCharacter
        let updatedStash = accumulated.updatedStash
        if (reward.gold > 0) {
          const goldResult = updatedCharacter.addGold(reward.gold)
          if (goldResult.isFailure) {
            return Result.fail<RewardApplicationResult>(DomainErrorCode.PostCombat_派發金幣失敗)
          }
          updatedCharacter = goldResult.value!
        }
        for (const itemRecord of reward.itemRecords) {
          const itemEntity = this.createRelicEntityFromRecord(itemRecord)
          const addItemResult = updatedStash.addItem(itemEntity)
          if (addItemResult.isFailure) {
            return Result.fail<RewardApplicationResult>(DomainErrorCode.PostCombat_派發物品失敗)
          }
          updatedStash = addItemResult.value!
        }
        return Result.success<RewardApplicationResult>({
          updatedCharacter,
          updatedStash,
        })
      },
      Result.success<RewardApplicationResult>({ updatedCharacter: character, updatedStash: stash })
    )
    return applyRewardResult
  }
  private createRelicEntityFromRecord(itemRecord: ItemRecord) {
    return this.itemEntityService.createRelicByRecord(itemRecord)
  }
  public commitClaimRewardsAndAdvance(parameters: {
    updatedCharacter: Character
    updatedStash: Stash
    selectedRewardIndexes: number[]
  }): Result<void, string> {
    const postCombatContext = this.accessor.getPostCombatContext()
    if (!postCombatContext) {
      return Result.fail(DomainErrorCode.PostCombat_上下文不存在)
    }
    if (postCombatContext.result !== 'WIN') {
      return Result.fail(DomainErrorCode.PostCombat_非勝利狀態)
    }
    const winContext = postCombatContext
    const updatedPostCombatContext: PostCombatContext = {
      result: 'WIN',
      combatDifficulty: winContext.combatDifficulty,
      isPlayerConfirmed: true,
      detail: {
        ...winContext.detail,
        selectedRewardIndexes: parameters.selectedRewardIndexes,
      },
    }
    return this.transactionManager.commitClaimRewardsAndAdvance({
      character: parameters.updatedCharacter,
      stash: parameters.updatedStash,
      postCombatContext: updatedPostCombatContext,
    })
  }
  public endRun(): Result<void> {
    const result = this.runService.endRun()
    if (result.isFailure) {
      return Result.fail(result.error!)
    }
    return Result.success()
  }
}
