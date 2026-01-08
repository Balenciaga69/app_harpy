import { Character } from '../../../../domain/character/Character'
import { ItemRecord } from '../../../../domain/item/Item'
import { CombatReward, PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { Stash } from '../../../../domain/stash/Stash'
import { DomainErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { ItemEntityService } from '../../../content-generation/service/item/ItemEntityService'
import { IRunService } from '../../run/RunService'
import { IPostCombatContextAccessor } from './PostCombatContextAccessor'
import { IPostCombatDomainConverter } from './PostCombatDomainConverter'
import { IPostCombatTransactionManager } from './PostCombatTransactionManager'
import { IPostCombatValidator } from './PostCombatValidator'
/**
 * 獎勵派發結果
 */
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
  commitClaimRewardsAndAdvance(params: {
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
  /** 載入戰鬥後相關的領域上下文 */
  public loadPostCombatDomainContexts() {
    return {
      character: this.converter.convertCharacterContextToDomain(),
      stash: this.converter.convertStashContextToDomain(),
    }
  }
  /** 驗證當前 Run 狀態是否為 POST_COMBAT */
  public validateRunStatus(): Result<void, string> {
    return this.validator.validateRunStatus()
  }
  /** 驗證獎勵選擇有效性 */
  public validateRewardSelection(selectedIndexes: number[]): Result<void, string> {
    return this.validator.validateRewardSelection(selectedIndexes)
  }
  /**
   * 應用獎勵到角色與倉庫
   * 遍歷選擇的獎勵索引，根據類型派發金幣與物品
   */
  public applyRewardsToCharacterAndStash(
    character: Character,
    stash: Stash,
    selectedIndexes: number[]
  ): Result<RewardApplicationResult> {
    const postCombatCtx = this.accessor.getPostCombatContext()
    if (!postCombatCtx || postCombatCtx.result !== 'WIN') {
      return Result.fail(DomainErrorCode.PostCombat_非勝利狀態)
    }
    const availableRewards = postCombatCtx.detail.availableRewards
    const applyRewardResult = selectedIndexes.reduce(
      (accumulatorResult, selectedIndex) => {
        // 如果前面已失敗，直接返回失敗結果
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
        // 派發金幣
        if (reward.gold > 0) {
          const goldResult = updatedCharacter.addGold(reward.gold)
          if (goldResult.isFailure) {
            return Result.fail<RewardApplicationResult>(DomainErrorCode.PostCombat_派發金幣失敗)
          }
          updatedCharacter = goldResult.value!
        }
        // 派發物品
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
  /**
   * 從 ItemRecord 建立 RelicEntity
   * 將獎勵中的物品記錄轉換為領域實體
   */
  private createRelicEntityFromRecord(itemRecord: ItemRecord) {
    return this.itemEntityService.createRelicByRecord(itemRecord)
  }
  /**
   * 原子性提交領獎與推進變更
   * 一次性提交角色、倉庫、PostCombat 上下文變更，標記玩家已確認領獎
   */
  public commitClaimRewardsAndAdvance(params: {
    updatedCharacter: Character
    updatedStash: Stash
    selectedRewardIndexes: number[]
  }): Result<void, string> {
    const postCombatCtx = this.accessor.getPostCombatContext()
    if (!postCombatCtx) {
      return Result.fail(DomainErrorCode.PostCombat_上下文不存在)
    }
    // 僅在勝利狀態時才能提交
    if (postCombatCtx.result !== 'WIN') {
      return Result.fail(DomainErrorCode.PostCombat_非勝利狀態)
    }
    // 構建更新後的 PostCombat 上下文，標記玩家已確認領獎
    const winCtx = postCombatCtx
    const updatedPostCombatCtx: PostCombatContext = {
      result: 'WIN',
      combatDifficulty: winCtx.combatDifficulty,
      isPlayerConfirmed: true,
      detail: {
        ...winCtx.detail,
        selectedRewardIndexes: params.selectedRewardIndexes,
      },
    }
    return this.transactionManager.commitClaimRewardsAndAdvance({
      character: params.updatedCharacter,
      stash: params.updatedStash,
      postCombatContext: updatedPostCombatCtx,
    })
  }
  public endRun(): Result<void> {
    const result = this.runService.endRun()
    if (result.isFailure) {
      return Result.fail(result.error!)
    }
    return Result.success(undefined)
  }
}
