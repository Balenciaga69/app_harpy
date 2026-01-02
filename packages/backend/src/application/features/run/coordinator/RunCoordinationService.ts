import { Result } from '../../../../shared/result/Result'
import { IRunContextHandler } from '../RunContextHandler'
/**
 * 關卡初始化服務介面
 * （暫時定義在此，後續應移至 StageInitializationService）
 */
export interface IStageInitializationService {
  initializeStage(stageNumber: number): Result<void, string>
}
/**
 * Run 協調服務介面
 * 職責：協調 Run 推進與關卡初始化，確保狀態一致性
 * 層級：高於 RunService
 */
export interface IRunCoordinationService {
  /**
   * 推進到下一關卡並初始化該關卡
   * 驗證狀態 → 推進 Run → 初始化新關卡
   */
  advanceToNextStageAndInitialize(stageNumber: number): Result<void, string>
}
/**
 * Run 協調服務：協調 Run 推進與關卡初始化
 * 職責：
 *   - 驗證當前 Run 狀態（必須在 POST_COMBAT）
 *   - 加載 Run 領域模型並執行推進邏輯
 *   - 初始化新關卡（生成敵人、節點、事件）
 *   - 確保推進與初始化的原子性
 * 邊界：接收高層 API 參數，協調 RunService 與 StageInitializationService
 */
export class RunCoordinationService implements IRunCoordinationService {
  constructor(
    private runContextHandler: IRunContextHandler,
    private stageInitializationService: IStageInitializationService
  ) {}
  /**
   * 推進到下一關卡並初始化該關卡
   * 流程：
   *   1. 驗證當前 Run 狀態為 POST_COMBAT
   *   2. 加載 Run 領域模型
   *   3. 執行推進邏輯（Run.advanceToNextStage）
   *   4. 提交 Run 變更
   *   5. 初始化新關卡（生成敵人、節點、事件）
   *   6. 返回結果
   *
   * 邊界條件：
   *   - 必須在 POST_COMBAT 狀態執行
   *   - stageNumber 必須是合法的關卡編號
   *   - 新關卡必須存在於當前章節
   *
   * 副作用：修改 Run Context、臨時上下文
   */
  advanceToNextStageAndInitialize(stageNumber: number): Result<void, string> {
    // TODO: 驗證當前 Run 狀態
    const validateResult = this.runContextHandler.validateRunStatus('POST_COMBAT')
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // TODO: 加載 Run 領域模型
    const run = this.runContextHandler.loadRunDomain()
    // TODO: 執行推進邏輯（驗證 stageNumber 合法性、狀態轉換）
    const advanceResult = run.advanceToNextStage(stageNumber)
    if (advanceResult.isFailure) return Result.fail(advanceResult.error!)
    // TODO: 提交 Run 變更
    const newRun = advanceResult.value!
    this.runContextHandler.commitRunChanges(newRun)
    // TODO: 初始化新關卡
    // - 根據新關卡的 stageNode 類型決定生成內容
    // - NORMAL/ELITE/BOSS：生成敵人
    // - EVENT：觸發事件
    const initResult = this.stageInitializationService.initializeStage(stageNumber)
    if (initResult.isFailure) return Result.fail(initResult.error!)
    return Result.success(undefined)
  }
}
