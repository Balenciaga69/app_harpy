import { EnemyAggregate, EnemyRole, EnemySpawnInfo } from '../../../../domain/entity/Enemy'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { IEnemyAggregateService } from './EnemyAggregateService'
export interface IEnemyRandomGenerateService {
  createRandomOne(): EnemyAggregate
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
  createRandomOne(): EnemyAggregate {
    const runContext = this.appContextService.GetContexts().runContext
    const { currentChapter, currentStage, chapters, seed } = runContext
    const availableInfos = this.getAvailableEnemySpawnInfos()
    if (availableInfos.length === 0) {
      throw new Error(`關卡 ${currentChapter}-${currentStage} 無可用敵人`)
    }
    const forRollInfos = availableInfos.map((info) => ({
      id: info.templateId,
      weight: info.weight,
    }))
    const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]
    return this.enemyAggregateService.create(rolledEnemyTemplateId, stageEnemyRole as EnemyRole)
  }
  /** 取得當前關卡可用的敵人生成資訊 */
  private getAvailableEnemySpawnInfos(): EnemySpawnInfo[] {
    const { enemyStore } = this.appContextService.GetConfig()
    const { currentChapter, encounteredEnemyIds } = this.appContextService.getRunContext()
    return enemyStore
      .getEnemySpawnInfosByChapter(currentChapter)
      .filter((info) => !encounteredEnemyIds.includes(info.templateId))
  }
}
