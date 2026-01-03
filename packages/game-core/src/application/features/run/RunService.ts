import { RunStatus } from '../../../domain/run/RunTypes'
import { Result } from '../../../shared/result/Result'
import { IRunContextHandler } from './RunContextHandler'
/**
 * Run 服務介面
 * 職責：協調 Run 聚合的狀態變更與相關業務邏輯
 * 邊界：確保每個 Run 操作的原子性與一致性
 */
export interface IRunService {
  /** 推進到下一個關卡，同時清理戰鬥後狀態 */
  advanceToNextStage(stageNumber: number): Result<void, string>
  /** 扣除重試次數，若失敗則重置相關狀態 */
  deductRetry(): Result<void, string>
  /** 改變 Run 狀態 */
  changeRunStatus(newStatus: RunStatus): Result<void, string>
  /** 結束當前 Run */
  endRun(): Result<void, string>
  /** 新增遇過的敵人記錄 */
  addEncounteredEnemy(enemyId: string): Result<void, string>
}
/**
 * Run 服務：管理 Run 聚合的狀態轉換與業務邏輯
 */
export class RunService implements IRunService {
  constructor(private runContextHandler: IRunContextHandler) {}
  /**
   * 推進到下一個關卡
   * 驗證階段與關卡編號，更新 Run 狀態，清理臨時上下文
   */
  advanceToNextStage(stageNumber: number): Result<void, string> {
    // 驗證當前 Run 狀態可以推進
    const validateResult = this.runContextHandler.validateRunStatus('POST_COMBAT')
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // 加載 Run 聚合
    const run = this.runContextHandler.loadRunDomain()
    // 執行推進邏輯
    const advanceResult = run.advanceToNextStage(stageNumber)
    if (advanceResult.isFailure) return Result.fail(advanceResult.error!)
    // 提交變更
    const newRun = advanceResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success(undefined)
  }
  /**
   * 扣除重試次數
   * 若成功，更新重試計數；若失敗，拋出錯誤
   */
  deductRetry(): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const deductResult = run.deductRetry()
    if (deductResult.isFailure) return Result.fail(deductResult.error!)
    const newRun = deductResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success(undefined)
  }
  /**
   * 改變 Run 狀態
   * 支援狀態遷移：IDLE → PRE_COMBAT → IN_COMBAT → POST_COMBAT → COMPLETED
   */
  changeRunStatus(newStatus: RunStatus): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const changeResult = run.changeStatus(newStatus)
    if (changeResult.isFailure) return Result.fail(changeResult.error!)
    const newRun = changeResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success(undefined)
  }
  /**
   * 結束當前 Run
   * 標記 Run 狀態為 COMPLETED
   */
  endRun(): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const endResult = run.endRun()
    if (endResult.isFailure) return Result.fail(endResult.error!)
    const newRun = endResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success(undefined)
  }
  /**
   * 新增遇過的敵人記錄
   */
  addEncounteredEnemy(enemyId: string): Result<void, string> {
    const run = this.runContextHandler.loadRunDomain()
    const addResult = run.addEncounteredEnemy(enemyId)
    if (addResult.isFailure) return Result.fail(addResult.error!)
    const newRun = addResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    return Result.success(undefined)
  }
}
