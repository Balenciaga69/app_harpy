import { EnemyAggregate, EnemyRole, EnemySpawnInfo } from '../../../../domain/entity/Enemy'
import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { IEnemyAggregateService } from './EnemyAggregateService'
/**
 * 敵人生成服務：協調敵人生成的完整流程
 * 職責：篩選可用敵人 → 權重骰選 → 實體化敵人
 */
export class EnemyGenerationService {
  constructor(
    private appContextService: IAppContextService,
    private enemyAggregateService: IEnemyAggregateService
  ) {}
  /**
   * 根據當前進度生成隨機敵人，流程：篩選可用敵人 → 權重骰選 → 實體化
   * 邊界：必須存在可用敵人樣板
   * 副作用：無(敵人實例化在記憶體中)
   */
  generateRandomEnemyAggregate() {
    const { currentChapter, encounteredEnemyIds, seed } = this.appContextService.GetContexts().runContext
    const { enemyStore } = this.appContextService.GetConfig()
    // 步驟 1: 取得可用敵人列表
    const infos: EnemySpawnInfo[] = enemyStore
      .getEnemySpawnInfosByChapter(currentChapter)
      .filter((i) => !encounteredEnemyIds.includes(i.templateId))
    if (infos.length === 0) {
      throw new Error('TODO: 沒有可用敵人')
    }
    // 步驟 2: 骰出敵人
    const forRollInfos = infos.map((info) => ({ id: info.templateId, weight: info.weight }))
    const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)
    // 步驟 3: 實體化敵人
    return this.createEnemyAggregate(rolledEnemyTemplateId)
  }
  /**
   * 根據骰選的敵人樣板 ID 實體化敵人實例
   * 副作用：無(記憶體中創建實例)
   * 邊界：敵人樣板與角色配置必須存在，否則拋錯
   */
  private createEnemyAggregate(rolledEnemyTemplateId: string) {
    const { currentChapter, currentStage, chapters } = this.appContextService.GetContexts().runContext
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage] // TODO: 型別轉換
    const aggregate = this.enemyAggregateService.create(rolledEnemyTemplateId, stageEnemyRole as EnemyRole)
    // TODO: 實體化敵人的完整邏輯
    return aggregate
  }
}
