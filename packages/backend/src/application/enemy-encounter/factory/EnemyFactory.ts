import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { EnemyInstance, EnemyRole, EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../shared/helpers/WeightRoller'
import { AffixFactory } from './AffixFactory'
export const EnemyFactory = () => {
  createRandomOne
}
const createRandomOne = (appCtx: IAppContext) => {
  const { seed } = appCtx.contexts.runContext
  // 取得可用敵人列表
  const [_, availableInfos] = getAvailableEnemyTemplateAndInfos(appCtx)
  // 骰出敵人
  const forRollInfos = availableInfos.map((info) => ({ id: info.templateId, weight: info.weight }))
  const rolledEnemyTemplateId = WeightRoller.roll(seed, forRollInfos)
  // 實體化敵人
  const enemyInstance = createInstance(appCtx, rolledEnemyTemplateId)
  return enemyInstance
}
/** 取得目前關卡可用的 EnemyTemplate 與 EnemySpawnInfo */
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
/** 實體化 Enemy */
const createInstance = (appCtx: IAppContext, rolledEnemyTemplateId: string) => {
  const { enemyStore } = appCtx.configStore
  const { currentChapter, currentStage, chapters, seed } = appCtx.contexts.runContext
  const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
  const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]
  const enemyTemplate = enemyStore.getEnemy(rolledEnemyTemplateId) // TODO: 找不到就拋錯
  const enemyRoleConfig = enemyTemplate?.roleConfigs[stageEnemyRole as EnemyRole] // TODO: 有錯就拋錯
  // 實體化 詞綴
  const affixInstances = AffixFactory.createMany({
    templateIds: enemyRoleConfig?.affixIds ?? [],
    chapter: currentChapter,
    stage: currentStage,
    difficulty: difficulty,
    sourceUnitId: rolledEnemyTemplateId,
  })
  // 實體化 大絕招
  const ultimateInstance: UltimateInstance = {
    id: `ultimate-instance-${seed}-${enemyRoleConfig?.ultimateId}`,
    templateId: enemyRoleConfig?.ultimateId || '',
    sourceUnitId: rolledEnemyTemplateId,
    pluginIds: [],
    atCreated: { chapter: currentChapter, stage: currentStage, difficulty: difficulty },
  }
  // 組合成 EnemyInstance
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
