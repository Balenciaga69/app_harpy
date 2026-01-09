import { ApplicationErrorCode } from '../../../../../shared/result/ErrorCodes'
import { Result } from '../../../../../shared/result/Result'
import { IEnemyRandomGenerateService } from '../../../../content-generation/service/enemy/EnemyRandomGenerateService'
import { IContextSnapshotAccessor } from '../../../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../../../core-infrastructure/context/service/ContextUnitOfWork'
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
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private unitOfWork: IContextUnitOfWork,
    private enemyRandomGenerateService: IEnemyRandomGenerateService
  ) {}
  initializeStage(stageNumber: number): Result<void, string> {
    // 檢查 stageNumber 有效性
    const runContext = this.contextAccessor.getRunContext()
    const { currentChapter, chapters } = runContext
    // 驗證章節信息存在
    const chapterInfo = chapters[currentChapter]
    if (!chapterInfo) {
      return Result.fail(ApplicationErrorCode.關卡_章節信息不存在)
    }
    // 驗證關卡節點存在
    const stageNode = chapterInfo.stageNodes[stageNumber]
    if (!stageNode) {
      return Result.fail(ApplicationErrorCode.關卡_節點不存在)
    }
    // 根據節點類型執行不同初始化邏輯
    if (stageNode === 'NORMAL' || stageNode === 'ELITE' || stageNode === 'BOSS') {
      return this.initializeCombatStage(stageNode, stageNumber)
    } else if (stageNode === 'EVENT') {
      return this.initializeEventStage(stageNumber)
    }
    return Result.fail(ApplicationErrorCode.關卡_未知類型)
  }
  private initializeCombatStage(stageType: string, stageNumber: number): Result<void, string> {
    // 生成敵人
    const enemyResult = this.enemyRandomGenerateService.createRandomOneByTemplateUsingCurrentContext()
    if (enemyResult.isFailure) {
      return Result.fail(enemyResult.error!)
    }
    const enemy = enemyResult.value!
    // 構建預戰鬥上下文（包含敵人信息和關卡難度類型）
    const preCombatContext = {
      enemy,
      combatDifficulty: stageType as 'NORMAL' | 'ELITE' | 'BOSS',
      stageNumber,
    }
    // 更新 temporaryContext，存入預戰鬥信息
    const runContext = this.contextAccessor.getRunContext()
    const updatedTemporaryContext = {
      ...runContext.temporaryContext,
      preCombat: preCombatContext,
    }
    // 提交變更
    this.unitOfWork.patchRunContext({
      temporaryContext: updatedTemporaryContext,
    })
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
  /**
   * 初始化事件關卡
   * 觸發隨機事件並處理其結果
   *
   * 流程：
   * - [待實作] 調用 eventProcessorService.selectAndProcessEvent(stageNumber)
   * - 根據事件類型執行對應效果
   *   - 給予資源事件：增加金幣/物品
   *   - 詛咒事件：施加負面效果
   *   - 選擇事件：允許玩家做出決策
   * - 將事件結果存入 Run.temporaryContext.event
   * - 可能需要更新 Run 狀態為 'EVENT' 而非 'PRE_COMBAT'
   *
   * 注意：目前返回成功，待事件服務完成後補充實作
   */
  private initializeEventStage(_stageNumber: number): Result<void, string> {
    TODO: 實作事件初始化邏輯
    return Result.success(undefined)
  }
}
