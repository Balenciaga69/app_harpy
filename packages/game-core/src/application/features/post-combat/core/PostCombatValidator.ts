import { DomainErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { RunStatusGuard } from '../../../core-infrastructure/run-status/RunStatusGuard'
import { IPostCombatContextAccessor } from './PostCombatContextAccessor'
/**
 * 戰鬥後驗證器
 * 職責：所有驗證邏輯，包括狀態驗證與獎勵選擇驗證
 */
export interface IPostCombatValidator {
  validateRunStatus(): Result<void, string>
  validateRewardSelection(selectedIndexes: number[]): Result<void, string>
}
export class PostCombatValidator implements IPostCombatValidator {
  constructor(private accessor: IPostCombatContextAccessor) {}

  public validateRunStatus(): Result<void, string> {
    const status = this.accessor.getRunStatus()
    return RunStatusGuard.requireStatus(status, 'POST_COMBAT')
  }

  public validateRewardSelection(selectedIndexes: number[]): Result<void, string> {
    const postCombatCtx = this.accessor.getPostCombatContext()
    if (!postCombatCtx) {
      return Result.fail(DomainErrorCode.PostCombat_上下文不存在)
    }
    if (postCombatCtx.result !== 'WIN') {
      return Result.fail(DomainErrorCode.PostCombat_非勝利狀態)
    }
    const { maxSelectableCount, availableRewards } = postCombatCtx.detail

    if (selectedIndexes.length !== maxSelectableCount) {
      return Result.fail(DomainErrorCode.PostCombat_獎勵數量不符)
    }

    if (selectedIndexes.some((idx) => typeof idx !== 'number' || idx < 0 || idx >= availableRewards.length)) {
      return Result.fail(DomainErrorCode.PostCombat_無效獎勵索引)
    }

    const uniqueIndexes = new Set(selectedIndexes)
    if (uniqueIndexes.size !== selectedIndexes.length) {
      return Result.fail(DomainErrorCode.PostCombat_重複獎勵索引)
    }
    return Result.success(undefined)
  }
}
