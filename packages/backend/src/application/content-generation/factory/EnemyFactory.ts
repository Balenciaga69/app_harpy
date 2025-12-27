import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { EnemyAggregate, EnemyRole, EnemySpawnInfo } from '../../../domain/entity/Enemy'
import { UltimateAggregate } from '../../../domain/ultimate/Ultimate'
import { AffixAggregate } from '../../../domain/affix/Affix'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../shared/helpers/WeightRoller'
import { AffixRecordFactory, AffixAggregateAssembler, AffixRecordCreateParams } from './AffixFactory'
import { UltimateRecordFactory, UltimateAggregateAssembler, UltimateRecordCreateParams } from './UltimateFactory'

/**
 * EnemyAggregateFactory：應用服務層的敵人聚合工廠
 * - 職責：協調多個工廠與存儲，生成完整敵人聚合根
 * - 依賴：IAppContext（獲取敵人、詞綴、大絕招配置及運行時狀態）
 * - 邊界：假設 appContext 已驗證並有效
 */
export class EnemyAggregateFactory {
  private readonly affixRecordFactory = new AffixRecordFactory()
  private readonly affixAssembler = new AffixAggregateAssembler()
  private readonly ultimateRecordFactory = new UltimateRecordFactory()
  private readonly ultimateAssembler = new UltimateAggregateAssembler()

  /**
   * 根據敵人樣板與應用上下文，生成完整敵人聚合根
   * - 邊界：敵人樣板、詞綴樣板、大絕招樣板必須存在
   * - 副作用：無
   */
  create(appCtx: IAppContext, enemyTemplateId: string, role: EnemyRole): EnemyAggregate {
    const { enemyStore } = appCtx.configStore
    const { currentChapter, currentStage } = appCtx.contexts.runContext
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)

    // 步驟 1: 驗證敵人樣板存在
    const enemyTemplate = enemyStore.getEnemy(enemyTemplateId)
    if (!enemyTemplate) {
      throw new Error(`敵人樣板不存在: ${enemyTemplateId}`)
    }

    // 步驟 2: 驗證敵人在指定角色的配置存在
    const roleConfig = enemyTemplate.roleConfigs[role]
    if (!roleConfig) {
      throw new Error(`敵人缺少角色配置: ${enemyTemplateId} - ${role}`)
    }

    // 步驟 3: 生成詞綴聚合
    const affixAggregates = this.createAffixAggregates(appCtx, roleConfig.affixIds, enemyTemplateId, difficulty)

    // 步驟 4: 生成大絕招聚合
    const ultimateAggregate = this.createUltimateAggregate(appCtx, roleConfig.ultimateId, enemyTemplateId, difficulty)

    // 步驟 5: 組裝敵人聚合根
    return new EnemyAggregate(
      `enemy-aggregate-${enemyTemplateId}-${appCtx.contexts.runContext.seed}`,
      role,
      enemyTemplate,
      affixAggregates,
      ultimateAggregate
    )
  }

  /**
   * 根據應用上下文，隨機骰選並生成敵人聚合根
   * - 流程：篩選可用敵人 → 權重骰選 → 根據關卡角色 → 實體化
   */
  createRandomOne(appCtx: IAppContext): EnemyAggregate {
    const { seed } = appCtx.contexts.runContext
    const { currentChapter, currentStage, chapters } = appCtx.contexts.runContext

    // 步驟 1: 取得可用敵人
    const availableInfos = this.getAvailableEnemySpawnInfos(appCtx)
    if (availableInfos.length === 0) {
      throw new Error(`關卡 ${currentChapter}-${currentStage} 無可用敵人`)
    }

    // 步驟 2: 權重骰選敵人樣板
    const forRollInfos = availableInfos.map((info) => ({
      id: info.templateId,
      weight: info.weight,
    }))
    const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)

    // 步驟 3: 獲取該關卡敵人應有的角色
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]

    // 步驟 4: 組裝敵人
    return this.create(appCtx, rolledEnemyTemplateId, stageEnemyRole as EnemyRole)
  }

  /**
   * 生成詞綴聚合集合
   */
  private createAffixAggregates(
    appCtx: IAppContext,
    affixTemplateIds: string[],
    sourceUnitId: string,
    difficulty: number
  ): AffixAggregate[] {
    const { affixStore } = appCtx.configStore
    const { currentChapter, currentStage } = appCtx.contexts.runContext

    const createParams: AffixRecordCreateParams = {
      difficulty,
      sourceUnitId,
      atCreated: { chapter: currentChapter, stage: currentStage, difficulty },
    }

    // 建立詞綴記錄
    const affixRecords = this.affixRecordFactory.createManyRecords(affixTemplateIds, createParams)

    // 取得詞綴樣板與效果
    const affixTemplates = affixTemplateIds.map((id) => affixStore.getAffix(id)).filter((t) => t !== undefined)

    // 取得該詞綴樣板需要的所有效果
    const allAffixEffects = affixTemplates
      .flatMap((t) => (t ? t.effectIds : []))
      .map((effectId) => affixStore.getAffixEffect(effectId))
      .filter((e) => e !== undefined)

    // 組裝詞綴聚合
    return this.affixAssembler.assembleMany({
      records: affixRecords,
      templates: affixTemplates,
      effects: allAffixEffects,
    })
  }

  /**
   * 生成大絕招聚合
   */
  private createUltimateAggregate(
    appCtx: IAppContext,
    ultimateTemplateId: string,
    sourceUnitId: string,
    difficulty: number
  ): UltimateAggregate {
    const { ultimateStore } = appCtx.configStore
    const { currentChapter, currentStage } = appCtx.contexts.runContext

    const ultimateTemplate = ultimateStore.getUltimate(ultimateTemplateId)
    if (!ultimateTemplate) {
      throw new Error(`大絕招樣板不存在: ${ultimateTemplateId}`)
    }

    const createParams: UltimateRecordCreateParams = {
      difficulty,
      sourceUnitId,
      atCreated: { chapter: currentChapter, stage: currentStage, difficulty },
    }

    const ultimateRecord = this.ultimateRecordFactory.createRecord(ultimateTemplateId, createParams)

    return this.ultimateAssembler.assemble({
      record: ultimateRecord,
      template: ultimateTemplate,
      pluginAffixes: [],
    })
  }

  /**
   * 取得目前關卡可用的敵人生成資訊，排除已遭遇敵人
   */
  private getAvailableEnemySpawnInfos(appCtx: IAppContext): EnemySpawnInfo[] {
    const { enemyStore } = appCtx.configStore
    const { currentChapter, encounteredEnemyIds } = appCtx.contexts.runContext

    return enemyStore
      .getEnemySpawnInfosByChapter(currentChapter)
      .filter((info) => !encounteredEnemyIds.includes(info.templateId))
  }
}
