import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { EnemyInstance, EnemyRole, EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../shared/helpers/WeightRoller'
import { AffixFactory } from './AffixFactory'
/** 敵人工廠：根據應用上下文生成隨機敵人實例，包含樣板選擇、詞綴與大絕招聚合 */
export const EnemyFactory = () => {
  createRandomOne
}
/** 根據種子與應用上下文生成隨機敵人實例，流程：篩選可用敵人 → 權重骰選 → 實體化 */
const createRandomOne = (appCtx: IAppContext) => {
  const { seed } = appCtx.contexts.runContext
  // 步驟 1: 取得可用敵人列表
  const [_, availableInfos] = getAvailableEnemyTemplateAndInfos(appCtx)
  // 步驟 2: 根據權重骰選敵人樣板
  const forRollInfos = availableInfos.map((info) => ({ id: info.templateId, weight: info.weight }))
  const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)
  // 步驟 3: 實體化敵人(聚合詞綴與大絕招)
  const enemyInstance = createInstance(appCtx, rolledEnemyTemplateId)
  return enemyInstance
}
/** 取得目前關卡可用的敵人樣板與生成資訊，排除已遭遇敵人 */
function getAvailableEnemyTemplateAndInfos(appCtx: IAppContext): [EnemyTemplate[], EnemySpawnInfo[]] {
  const { runContext } = appCtx.contexts
  const { enemyStore } = appCtx.configStore
  const { encounteredEnemyIds, currentChapter } = runContext
  const info: EnemySpawnInfo[] = enemyStore
    .getEnemySpawnInfosByChapter(currentChapter)
    .filter((i) => !encounteredEnemyIds.includes(i.templateId))
  const templates = info.map((i) => enemyStore.getEnemy(i.templateId)).filter((e) => e !== undefined)
  return [templates, info]
}
/**
 * 實體化敵人實例，聚合詞綴與大絕招
 * 邊界：敵人樣板與角色配置必須存在
 * 副作用：無
 */
const createInstance = (appCtx: IAppContext, rolledEnemyTemplateId: string) => {
  const { enemyStore } = appCtx.configStore
  const { currentChapter, currentStage, chapters, seed } = appCtx.contexts.runContext
  const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
  const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]
  // 步驟 1: 驗證敵人樣板存在，不存在則拋錯
  const enemyTemplate = enemyStore.getEnemy(rolledEnemyTemplateId)
  if (!enemyTemplate) {
    throw new Error(`敵人樣板不存在: ${rolledEnemyTemplateId}`)
  }
  // 步驟 2: 驗證敵人在該角色的配置存在
  const enemyRoleConfig = enemyTemplate?.roleConfigs[stageEnemyRole as EnemyRole]
  if (!enemyRoleConfig) {
    throw new Error(`敵人缺少角色配置: ${rolledEnemyTemplateId} - ${stageEnemyRole}`)
  }
  // 步驟 3: 實體化詞綴
  const affixInstances = AffixFactory.createMany({
    templateIds: enemyRoleConfig?.affixIds ?? [],
    chapter: currentChapter,
    stage: currentStage,
    difficulty: difficulty,
    sourceUnitId: rolledEnemyTemplateId,
  })
  // 步驟 4: 實體化大絕招
  const ultimateInstance: UltimateInstance = {
    id: `ultimate-instance-${seed}-${enemyRoleConfig?.ultimateId}`,
    templateId: enemyRoleConfig?.ultimateId || '',
    sourceUnitId: rolledEnemyTemplateId,
    pluginIds: [],
    atCreated: { chapter: currentChapter, stage: currentStage, difficulty: difficulty },
  }
  // 步驟 5: 組合成完整敵人實例
  const enemyInstance: EnemyInstance = {
    affixes: affixInstances,
    id: `enemy-instance-${rolledEnemyTemplateId}-${seed}`,
    role: stageEnemyRole as EnemyRole,
    ultimateSkill: ultimateInstance,
    templateId: rolledEnemyTemplateId,
    atCreated: { chapter: currentChapter, stage: currentStage, difficulty: difficulty },
  }
  return enemyInstance
}
