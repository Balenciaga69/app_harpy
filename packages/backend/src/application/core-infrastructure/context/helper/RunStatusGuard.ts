// TODO: AI 自動生成的內容 待觀察是否可用
import { DomainErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { IRunContext } from '../interface/IRunContext'
import { RunStatus } from '../interface/RunStatus'
/**
 * Run 狀態轉換規則
 * 定義每個狀態允許轉換到哪些狀態
 */
const ALLOWED_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  STAGE_SELECTION: ['PRE_COMBAT', 'SHOP', 'EVENT', 'RUN_ENDED'], // 選關後可以：戰鬥、商店、事件、結束
  PRE_COMBAT: ['IN_COMBAT', 'STAGE_SELECTION'], // 戰前準備後可以：開戰、返回選關
  IN_COMBAT: ['POST_COMBAT_PENDING', 'RUN_ENDED'], // 戰鬥中只能：結束戰鬥、Run 結束
  POST_COMBAT_PENDING: ['STAGE_SELECTION', 'RUN_ENDED'], // 領獎後可以：選下一關、Run 結束
  SHOP: ['STAGE_SELECTION'], // 商店離開後回到選關
  EVENT: ['STAGE_SELECTION', 'SHOP', 'IN_COMBAT'], // 事件後可能：選關、商店、戰鬥
  RUN_ENDED: [], // 結束狀態不能轉換
}

/**
 * Run 狀態守衛器
 * 職責：驗證 Run 狀態轉換的合法性
 */
export class RunStatusGuard {
  /**
   * 檢查狀態轉換是否合法
   * @param current 當前狀態
   * @param next 目標狀態
   * @returns 是否允許轉換
   */
  canTransitionTo(current: RunStatus, next: RunStatus): boolean {
    const allowedNextStates = ALLOWED_TRANSITIONS[current]
    return allowedNextStates?.includes(next) ?? false
  }

  /**
   * 要求 Run 必須處於指定狀態
   * @param run Run 上下文
   * @param expectedStatus 期望的狀態
   * @returns 成功或失敗結果
   */
  requireStatus(run: IRunContext, expectedStatus: RunStatus): Result<void, DomainErrorCode> {
    if (run.status !== expectedStatus) {
      return Result.fail(DomainErrorCode.Run_狀態不符)
    }
    return Result.success(undefined)
  }

  /**
   * 要求 Run 必須處於指定狀態之一
   * @param run Run 上下文
   * @param expectedStatuses 期望的狀態列表
   * @returns 成功或失敗結果
   */
  requireOneOfStatuses(run: IRunContext, expectedStatuses: RunStatus[]): Result<void, DomainErrorCode> {
    if (!expectedStatuses.includes(run.status)) {
      return Result.fail(DomainErrorCode.Run_狀態不符)
    }
    return Result.success(undefined)
  }

  /**
   * 驗證狀態轉換
   * @param run Run 上下文
   * @param nextStatus 目標狀態
   * @returns 成功或失敗結果
   */
  validateTransition(run: IRunContext, nextStatus: RunStatus): Result<void, DomainErrorCode> {
    if (!this.canTransitionTo(run.status, nextStatus)) {
      return Result.fail(DomainErrorCode.Run_非法狀態轉換)
    }
    return Result.success(undefined)
  }

  /**
   * 檢查 Run 是否已結束
   */
  isRunEnded(run: IRunContext): boolean {
    return run.status === 'RUN_ENDED'
  }

  /**
   * 檢查 Run 是否在戰鬥中
   */
  isInCombat(run: IRunContext): boolean {
    return run.status === 'IN_COMBAT'
  }

  /**
   * 檢查是否有待領取的獎勵
   */
  hasPendingRewards(run: IRunContext): boolean {
    return run.status === 'POST_COMBAT_PENDING' && !!run.temporaryContext.postCombat
  }
}
