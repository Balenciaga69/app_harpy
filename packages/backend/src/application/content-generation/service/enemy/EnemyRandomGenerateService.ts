import { EnemyAggregate, EnemyRole, EnemySpawnInfo } from '../../../../domain/entity/Enemy'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { IEnemyAggregateService } from './EnemyAggregateService'
export interface IEnemyRandomGenerateService {
  createRandomOneByTemplateUsingCurrentContext(): EnemyAggregate
}
/**
 * EnemyRandomGenerateService：負責真正的隨機選擇與封裝流程（createRandomOne）
 * - 僅負責選取哪個樣板、如何決策，組裝則委派給 IEnemyAggregateService
 */
export class EnemyRandomGenerateService implements IEnemyRandomGenerateService {
  constructor(
    private readonly enemyAggregateService: IEnemyAggregateService,
    private readonly appContextService: IAppContextService
  ) {}
  /** 隨機選擇並創建一個 EnemyAggregate */
  createRandomOneByTemplateUsingCurrentContext(): EnemyAggregate {
    const runContext = this.appContextService.GetContexts().runContext
    const { currentChapter, currentStage, chapters, seed } = runContext
    // 取得當前關卡可用的敵人生成資訊
    const availableInfos = this.getAvailableEnemySpawnInfos()
    const forRollInfos = availableInfos.map((info) => ({
      id: info.templateId,
      weight: info.weight,
    }))
    // 使用權重骰子選出敵人樣板
    const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)
    // 取得敵人角色設定
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]
    // 使用 EnemyAggregateService 建立敵人聚合體
    return this.enemyAggregateService.createOneByTemplateUsingCurrentContext(
      rolledEnemyTemplateId,
      stageEnemyRole as EnemyRole
    )
  }
  /** 取得當前關卡可用的敵人生成資訊 */
  private getAvailableEnemySpawnInfos(): EnemySpawnInfo[] {
    const { enemyStore } = this.appContextService.GetConfig()
    const { currentChapter, encounteredEnemyIds, currentStage } = this.appContextService.getRunContext()
    // 過濾出尚未遭遇過的敵人生成資訊
    const availableInfos = enemyStore
      .getEnemySpawnInfosByChapter(currentChapter)
      .filter((info) => !encounteredEnemyIds.includes(info.templateId))
    // 確保至少有一個可用敵人
    if (availableInfos.length === 0) {
      throw new Error(`關卡 ${currentChapter}-${currentStage} 無可用敵人`)
    }
    // 回傳可用敵人生成資訊
    return availableInfos
  }
}
