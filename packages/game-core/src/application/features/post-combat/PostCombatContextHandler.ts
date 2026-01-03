import { CombatReward, PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { Character } from '../../../domain/character/Character'
import { Stash } from '../../../domain/stash/Stash'
import { Result } from '../../../shared/result/Result'
import { DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RunStatusGuard } from '../../core-infrastructure/run-status/RunStatusGuard'
import { ItemEntityService } from '../../content-generation/service/item/ItemEntityService'
/**
 * 獎勵派發結果
 */
export interface RewardApplicationResult {
  readonly updatedCharacter: Character
  readonly updatedStash: Stash
}
export interface IPostCombatContextHandler {
  getPostCombatContext(): PostCombatContext | undefined
  getRemainingFailRetries(): number
  loadPostCombatDomainContexts(): {
    character: Character
    stash: Stash
  }
  validateRunStatus(): Result<void, string>
  updatePostCombatContext(updatedPostCombat: PostCombatContext): Result<void>
  commitRewardSelectionTransaction(updates: { characterRecord?: any; stash?: Stash }): Result<void>
  commitRetryDeductionTransaction(updates: { remainingFailRetries: number }): Result<void>
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
    private contextAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter,
    private unitOfWork: IContextUnitOfWork,
    private itemEntityService: ItemEntityService
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
  /**
   * 驗證獎勵選擇有效性
   */
  public validateRewardSelection(selectedIndexes: number[]): Result<void, string> {
    const postCombatCtx = this.getPostCombatContext()
    if (!postCombatCtx) {
      return Result.fail(DomainErrorCode.PostCombat_上下文不存在)
    }
    if (postCombatCtx.result !== 'WIN') {
      return Result.fail(DomainErrorCode.PostCombat_非勝利狀態)
    }
    const { maxSelectableCount, availableRewards } = postCombatCtx.detail
    // 檢查 selectedIndexes.length == maxSelectableCount
    if (selectedIndexes.length != maxSelectableCount) {
      return Result.fail(DomainErrorCode.PostCombat_獎勵數量不符)
    }
    // 檢查每個 index 都在 [0, availableRewards.length)
    if (selectedIndexes.some((idx) => typeof idx !== 'number' || idx < 0 || idx >= availableRewards.length)) {
      return Result.fail(DomainErrorCode.PostCombat_無效獎勵索引)
    }
    // 檢查沒有重複索引
    const uniqueIndexes = new Set(selectedIndexes)
    if (uniqueIndexes.size !== selectedIndexes.length) {
      return Result.fail(DomainErrorCode.PostCombat_重複獎勵索引)
    }
    return Result.success(undefined)
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
    const postCombatCtx = this.getPostCombatContext()
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
  private createRelicEntityFromRecord(itemRecord: any) {
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
    const postCombatCtx = this.getPostCombatContext()
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
    // 累積所有變更到 unitOfWork，一次性提交
    this.unitOfWork
      .patchCharacterContext({
        ...params.updatedCharacter.record,
      })
      .patchStashContext({
        items: params.updatedStash.listItems().map((item) => item.record),
      })
      .patchRunContext({
        temporaryContext: {
          postCombat: updatedPostCombatCtx,
        },
      })
      .commit()
    return Result.success(undefined)
  }
}
