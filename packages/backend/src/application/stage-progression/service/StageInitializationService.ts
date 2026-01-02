import { Result } from '../../../shared/result/Result'
/**
 * 關卡初始化服務介面
 * 職責：根據關卡節點類型初始化關卡內容（敵人、事件等）
 */
export interface IStageInitializationService {
  /**
   * 初始化指定關卡
   * 根據節點類型生成對應內容並存入臨時上下文
   */
  initializeStage(stageNumber: number): Result<void, string>
}
/**
 * 關卡初始化服務：初始化新關卡
 * 職責：
 *   - 根據關卡節點類型判斷該關卡性質
 *   - 生成戰鬥關卡的敵人（NORMAL/ELITE/BOSS）
 *   - 觸發事件關卡的隨機事件（EVENT）
 *   - 將生成的內容存入臨時上下文供戰鬥使用
 * 邊界：
 *   - 只負責內容生成，不負責 Run 狀態轉換
 *   - 生成的內容存入 Run.temporaryContext.preCombat
 *   - 事件觸發結果存入 Run.temporaryContext.event
 */
export class StageInitializationService implements IStageInitializationService {
  /**
   * 初始化指定關卡
   * 流程：
   *   1. 獲取當前 Run 與關卡節點類型
   *   2. 根據節點類型分別處理
   *   3. 生成對應內容並存入臨時上下文
   *   4. 提交變更
   *
   * 邊界條件：
   *   - stageNumber 必須有效且在當前章節內
   *   - 節點類型必須存在
   *   - 生成的內容必須符合規則
   *
   * 副作用：修改 Run Context 的 temporaryContext
   */
  initializeStage(_stageNumber: number): Result<void, string> {
    // TODO: 檢查 stageNumber 有效性
    // - 驗證 stageNumber 是否在有效範圍內
    // - 驗證該關卡節點是否存在
    // TODO: 獲取當前 Run 與關卡節點類型
    // 1. 從 contextAccessor 獲取 Run Context
    // 2. 根據 currentChapter 與 stageNumber 查找 stageNode 類型
    // 3. 判斷節點類型：NORMAL/ELITE/BOSS/EVENT
    // TODO: 根據節點類型執行不同初始化邏輯
    // - if (stageType === 'NORMAL' || 'ELITE' || 'BOSS'):
    //     調用 enemyRandomGenerateService.generateEnemy()
    //     將生成的敵人存入 temporaryContext.preCombat
    // - else if (stageType === 'EVENT'):
    //     調用 eventProcessorService.selectAndProcessEvent()
    //     將事件結果存入 temporaryContext.event
    // TODO: 提交變更
    // 使用 unitOfWork.patchRunContext() 更新 temporaryContext
    return Result.success(undefined)
  }
  /**
   * 初始化戰鬥關卡
   * 根據節點難度等級生成對應敵人
   *
   * TODO: 實作邏輯
   * - 根據 stageType 確定難度級別
   * - 調用 enemyRandomGenerateService.generateEnemy(stageType)
   * - 提取敵人記錄與難度資訊
   * - 構建 preCombatContext
   * - 存入 Run.temporaryContext.preCombat
   */
  private initializeCombatStage(_stageType: string, _stageNumber: number): Result<void, string> {
    // TODO: 補充實作
    return Result.success(undefined)
  }
  /**
   * 初始化事件關卡
   * 觸發隨機事件並處理其結果
   *
   * TODO: 實作邏輯
   * - 調用 eventProcessorService.selectAndProcessEvent(stageNumber)
   * - 根據事件類型執行對應效果
   *   - 給予資源事件：增加金幣/物品
   *   - 詛咒事件：施加負面效果
   *   - 選擇事件：允許玩家做出決策
   * - 將事件結果存入 Run.temporaryContext.event
   * - 可能需要更新 Run 狀態為 'EVENT' 而非 'PRE_COMBAT'
   */
  private initializeEventStage(_stageNumber: number): Result<void, string> {
    // TODO: 補充實作
    return Result.success(undefined)
  }
}
