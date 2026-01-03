import { Result } from '../../../../shared/result/Result'
import { IRunService } from '../../run/RunService'
import { IPostCombatContextHandler } from '../PostCombatContextHandler'
/**
 * 戰鬥後協調服務介面
 * 職責：協調獎勵派發與 Run 推進，確保兩個事務的原子性
 * 層級：高於 PostCombatProcessor 與 RunService
 */
export interface IPostCombatCoordinationService {
  /**
   * 協調領獎與推進
   * 驗證選擇的獎勵索引 → 派發獎勵 → 推進關卡
   * 所有變更在單個 UnitOfWork 中原子性提交
   */
  claimRewardsAndAdvance(params: { selectedRewardIndexes: number[]; nextStageNumber: number }): Result<void, string>
}
/**
 * 戰鬥後協調服務：協調領獎與推進
 * 職責：
 *   - 驗證玩家選擇的獎勵索引有效性
 *   - 應用獎勵到角色與倉庫
 *   - 推進 Run 到下一關卡
 *   - 所有變更在一個 UnitOfWork 中累積，最後一次提交
 * 邊界：接收高層 API 參數，協調多個領域服務執行
 */
export class PostCombatCoordinationService implements IPostCombatCoordinationService {
  constructor(
    private postCombatContextHandler: IPostCombatContextHandler,
    private runService: IRunService
  ) {}
  /**
   * 協調領獎與推進的完整流程
   * 副作用：修改角色、倉庫、PostCombat 上下文
   */
  claimRewardsAndAdvance(params: { selectedRewardIndexes: number[]; nextStageNumber: number }): Result<void, string> {
    // 1. 驗證 Run 狀態
    const validateStatus = this.postCombatContextHandler.validateRunStatus()
    if (validateStatus.isFailure) return Result.fail(validateStatus.error!)
    // 2. 驗證獎勵選擇有效性（Handler 已實作邏輯）
    const validateReward = this.postCombatContextHandler.validateRewardSelection(params.selectedRewardIndexes)
    if (validateReward.isFailure) return Result.fail(validateReward.error!)
    // 3. 加載角色與倉庫領域模型
    const { character, stash } = this.postCombatContextHandler.loadPostCombatDomainContexts()
    // 4. 應用獎勵到角色與倉庫（Handler 已實作邏輯）
    const applyRewardResult = this.postCombatContextHandler.applyRewardsToCharacterAndStash(
      character,
      stash,
      params.selectedRewardIndexes
    )
    if (applyRewardResult.isFailure) return Result.fail(applyRewardResult.error!)
    // 5. 原子性提交所有變更（Handler 已實作邏輯）
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
