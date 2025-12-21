import { EnemyInstance, EnemyRole, EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { IRunContext } from '../../domain/run/IRunContext'
import { UltimateInstance } from '../../domain/ultimate/UltimateInstance'
import { DifficultyHelper } from '../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../shared/helpers/WeightRoller'
import { AffixInstantiator } from '../instantiator/AffixInstantiator'
import { TemplateStore } from '../store/TemplateStore'

export const EnemyInstanceFactory = () => {
  generate
}

const generate = (ctx: IRunContext, templateStore: TemplateStore) => {
  // 取得可用敵人列表
  const [_, availableInfos] = getAvailableEnemyTemplateAndInfos(ctx, templateStore)
  // 骰出敵人
  const forRollInfos = availableInfos.map((info) => ({ id: info.templateId, weight: info.weight }))
  const rolledEnemyTemplateId = WeightRoller.rollTemplate(ctx.seed, forRollInfos)
  // 實體化敵人
  const enemyInstance = createInstance(ctx, templateStore, rolledEnemyTemplateId)
  return enemyInstance
}

/** 取得目前關卡可用的 EnemyTemplate 與 EnemySpawnInfo */
function getAvailableEnemyTemplateAndInfos(
  ctx: IRunContext,
  templateStore: TemplateStore
): [EnemyTemplate[], EnemySpawnInfo[]] {
  const encounteredIds = ctx.encounteredEnemyIds
  const currentChapter = ctx.currentChapter
  const info = templateStore
    .getEnemySpawnInfosByChapter(currentChapter)
    .filter((i) => !encounteredIds.includes(i.templateId))
  const templates = info.map((i) => templateStore.getEnemy(i.templateId)).filter((e) => e !== undefined)

  return [templates, info]
}

/** 實體化 Enemy */
const createInstance = (ctx: IRunContext, templateStore: TemplateStore, rolledEnemyTemplateId: string) => {
  const difficulty = DifficultyHelper.getDifficultyFactor(ctx.currentChapter, ctx.currentStage)
  const stageEnemyRole = ctx.chapters[ctx.currentChapter].stageNodes[ctx.currentStage]
  const enemyTemplate = templateStore.getEnemy(rolledEnemyTemplateId) // TODO: 找不到就拋錯
  const enemyRoleConfig = enemyTemplate?.roleConfigs[stageEnemyRole as EnemyRole] // TODO: 有錯就拋錯
  // 實體化 詞綴
  const affixInstances = AffixInstantiator.instantiateMany({
    templateIds: enemyRoleConfig?.affixIds ?? [],
    chapter: ctx.currentChapter,
    stage: ctx.currentStage,
    difficulty: difficulty,
    sourceUnitId: rolledEnemyTemplateId,
  })

  // 實體化 大絕招
  const ultimateInstance: UltimateInstance = {
    id: `ultimate-instance-${ctx.seed}-${enemyRoleConfig?.ultimateId}`,
    templateId: enemyRoleConfig?.ultimateId || '',
    sourceUnitId: rolledEnemyTemplateId,
    pluginIds: [],
    atCreated: { chapter: ctx.currentChapter, stage: ctx.currentStage, difficulty: difficulty },
  }

  // 組合成 EnemyInstance
  const enemyInstance: EnemyInstance = {
    affixes: affixInstances,
    id: `enemy-instance-${rolledEnemyTemplateId}-${ctx.seed}`,
    role: stageEnemyRole as EnemyRole,
    ultimateSkill: ultimateInstance,
    templateId: rolledEnemyTemplateId,
    atCreated: { chapter: ctx.currentChapter, stage: ctx.currentStage, difficulty: difficulty },
  }
  return enemyInstance
}
