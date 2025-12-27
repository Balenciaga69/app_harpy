import { AffixAggregate } from '../../../domain/affix/Affix'
import { EnemyAggregate, EnemyRole, EnemySpawnInfo } from '../../../domain/entity/Enemy'
import { UltimateAggregate } from '../../../domain/ultimate/Ultimate'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../shared/helpers/WeightRoller'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { AffixRecordCreateParams, AffixRecordFactory } from '../factory/AffixFactory'
import { UltimateRecordCreateParams, UltimateRecordFactory } from '../factory/UltimateFactory'
import { IAffixAggregateService } from './AffixAggregateService'
import { IUltimateAggregateService } from './UltimateAggregateService'
/**
 * IEnemyAggregateService：對外提供依據樣板 ID 與角色創建 EnemyAggregate 的純邏輯服務
 * - 無隨機性：輸入相同參數應產生相同結果（便於測試）
 */
export interface IEnemyAggregateService {
  create(enemyTemplateId: string, role: EnemyRole): EnemyAggregate
}
/**
 * IEnemyRandomService：負責真正的隨機選擇（createRandomOne）
 * - 依賴抽象的 IEnemyAggregateService 以完成最終組裝
 */
export interface IEnemyRandomService {
  createRandomOne(): EnemyAggregate
}
/**
 * EnemyAggregateService：負責以指定樣板與角色生成完整 EnemyAggregate
 * - 所有外部依賴透過建構式注入，以便測試與替換實作
 */
export class EnemyAggregateService implements IEnemyAggregateService {
  constructor(
    private readonly affixRecordFactory: AffixRecordFactory,
    private readonly affixAggregateService: IAffixAggregateService,
    private readonly ultimateAggregateService: IUltimateAggregateService,
    private readonly appContextService: IAppContextService
  ) {}
  /**
   * 根據敵人樣板與應用上下文，生成完整敵人聚合根（無隨機性）
   */
  create(enemyTemplateId: string, role: EnemyRole): EnemyAggregate {
    const { enemyStore } = this.appContextService.GetConfig()
    const { currentChapter, currentStage } = this.appContextService.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const enemyTemplate = enemyStore.getEnemy(enemyTemplateId)
    if (!enemyTemplate) {
      throw new Error(`敵人樣板不存在: ${enemyTemplateId}`)
    }
    const roleConfig = enemyTemplate.roleConfigs[role]
    if (!roleConfig) {
      throw new Error(`敵人缺少角色配置: ${enemyTemplateId} - ${role}`)
    }
    const affixAggregates = this.createAffixAggregates(roleConfig.affixIds, enemyTemplateId, difficulty)
    const ultimateAggregate = this.createUltimateAggregate(roleConfig.ultimateId, enemyTemplateId, difficulty)
    return new EnemyAggregate(
      `enemy-aggregate-${enemyTemplateId}-${this.appContextService.getRunContext().seed}`,
      role,
      enemyTemplate,
      affixAggregates,
      ultimateAggregate
    )
  }
  private createAffixAggregates(
    affixTemplateIds: string[],
    sourceUnitId: string,
    difficulty: number
  ): AffixAggregate[] {
    const { currentChapter, currentStage } = this.appContextService.getRunContext()
    const createParams: AffixRecordCreateParams = {
      difficulty,
      sourceUnitId,
      atCreated: { chapter: currentChapter, stage: currentStage, difficulty },
    }
    const affixRecords = this.affixRecordFactory.createManyRecords(affixTemplateIds, createParams)
    return this.affixAggregateService.createMany(affixRecords)
  }
  private createUltimateAggregate(
    ultimateTemplateId: string,
    sourceUnitId: string,
    difficulty: number
  ): UltimateAggregate {
    const { ultimateStore } = this.appContextService.GetConfig()
    const { currentChapter, currentStage } = this.appContextService.getRunContext()
    const ultimateTemplate = ultimateStore.getUltimate(ultimateTemplateId)
    if (!ultimateTemplate) {
      throw new Error(`大絕招樣板不存在: ${ultimateTemplateId}`)
    }
    const createParams: UltimateRecordCreateParams = {
      difficulty,
      sourceUnitId,
      atCreated: { chapter: currentChapter, stage: currentStage, difficulty },
    }
    const ultimateRecord = UltimateRecordFactory.createRecord(ultimateTemplateId, createParams)
    return this.ultimateAggregateService.create(ultimateRecord)
  }
}
/**
 * EnemyRandomService：負責真正的隨機選擇與封裝流程（createRandomOne）
 * - 僅負責選取哪個樣板、如何決策，組裝則委派給 IEnemyAggregateService
 */
export class EnemyRandomService implements IEnemyRandomService {
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
