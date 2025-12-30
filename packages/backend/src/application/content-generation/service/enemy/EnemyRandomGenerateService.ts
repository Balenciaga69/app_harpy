import { EnemyAggregate, EnemyRole, EnemySpawnInfo } from '../../../../domain/entity/Enemy'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { Result } from '../../../../shared/result/Result'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { IEnemyAggregateService } from './EnemyAggregateService'
/**
 * 敵人生成錯誤類型
 * - 無可用敵人: 關卡無可用敵人（已全部遭遇過）
 * - 關卡資訊無效: 關卡資訊不完整或無效
 */
export type EnemyGenerationError = ApplicationErrorCode.敵人_無可用敵人 | ApplicationErrorCode.敵人_關卡資訊無效
export interface IEnemyRandomGenerateService {
  /** 隨機選擇並創建一個 EnemyAggregate */
  createRandomOneByTemplateUsingCurrentContext(): Result<EnemyAggregate, EnemyGenerationError>
}
/**
 * EnemyRandomGenerateService：負責真正的隨機選擇與封裝流程( createRandomOne )
 * - 僅負責選取哪個樣板、如何決策，組裝則委派給 IEnemyAggregateService
 */
export class EnemyRandomGenerateService implements IEnemyRandomGenerateService {
  constructor(
    private readonly enemyAggregateService: IEnemyAggregateService,
    private readonly appContextService: IAppContextService
  ) {}
  /**
   * 隨機選擇並創建一個 EnemyAggregate
   *
   * 流程：
   * 1. 取得當前關卡的可用敵人生成資訊（已過濾已遭遇過的）
   * 2. 使用權重骰子選出一個敵人樣板
   * 3. 委派給 EnemyAggregateService 建立敵人聚合體
   *
   * 失敗情況：
   * - NoAvailableEnemies: 當前關卡已無可用敵人（全部遭遇過）
   * - InvalidStageInfo: 關卡資訊缺失或無效（無法取得敵人角色）
   */
  createRandomOneByTemplateUsingCurrentContext(): Result<EnemyAggregate, EnemyGenerationError> {
    const runContext = this.appContextService.getAllContexts().runContext
    const { currentChapter, currentStage, chapters, seed } = runContext
    // 步驟 1: 取得當前關卡可用的敵人生成資訊
    const availableInfosResult = this.getAvailableEnemySpawnInfos()
    if (availableInfosResult.isFailure) {
      return Result.fail(availableInfosResult.error as EnemyGenerationError)
    }
    const availableInfos = availableInfosResult.value!
    // 步驟 2: 使用權重骰子選出敵人樣板
    const forRollInfos = availableInfos.map((info) => ({
      id: info.templateId,
      weight: info.weight,
    }))
    const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)
    // 步驟 3: 取得敵人角色設定
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]
    if (!stageEnemyRole) {
      return Result.fail(ApplicationErrorCode.敵人_關卡資訊無效)
    }
    // 步驟 4: 使用 EnemyAggregateService 建立敵人聚合體
    const enemy = this.enemyAggregateService.createOneByTemplateUsingCurrentContext(
      rolledEnemyTemplateId,
      stageEnemyRole as EnemyRole
    )
    return Result.success(enemy)
  }
  /**
   * 取得當前關卡可用的敵人生成資訊
   *
   * 流程：
   * 1. 從 enemyStore 取得當前章節的所有敵人生成資訊
   * 2. 過濾出尚未遭遇過的敵人
   * 3. 驗證至少有一個可用敵人
   *
   * 失敗情況：
   * - 無可用敵人: 當前關卡已無可用敵人（全部遭遇過）
   */
  private getAvailableEnemySpawnInfos(): Result<EnemySpawnInfo[], ApplicationErrorCode.敵人_無可用敵人> {
    const { enemyStore } = this.appContextService.getConfigStore()
    const { currentChapter, encounteredEnemyIds } = this.appContextService.getRunContext()
    // 過濾出尚未遭遇過的敵人生成資訊
    const availableInfos = enemyStore
      .getEnemySpawnInfosByChapter(currentChapter)
      .filter((info) => !encounteredEnemyIds.includes(info.templateId))
    // 確保至少有一個可用敵人
    if (availableInfos.length === 0) {
      return Result.fail(ApplicationErrorCode.敵人_無可用敵人)
    }
    // 回傳可用敵人生成資訊
    return Result.success(availableInfos)
  }
}
