import { EnemyRole, EnemySpawnInfo } from '../../../domain/entity/Enemy'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../shared/helpers/WeightRoller'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'

/* 協調敵人生成的完整流程 */
export class EnemyGenerationService {
  constructor(private appCtx: IAppContext) {}

  /* 生成隨機敵人 */
  generateRandomEnemy() {
    const { seed } = this.appCtx.contexts.runContext
    const { encounteredEnemyIds, currentChapter } = this.appCtx.contexts.runContext
    const { enemyStore } = this.appCtx.configStore

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
    return this.createEnemyInstance(rolledEnemyTemplateId)
  }

  /* 實體化 Enemy */
  private createEnemyInstance(rolledEnemyTemplateId: string) {
    const { enemyStore } = this.appCtx.configStore
    const { currentChapter, currentStage, chapters } = this.appCtx.contexts.runContext

    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage] // TODO: 型別轉換

    const enemyTemplate = enemyStore.getEnemy(rolledEnemyTemplateId)
    if (!enemyTemplate) throw new Error('TODO: 找不到敵人樣板')

    const enemyRoleConfig = enemyTemplate.roleConfigs[stageEnemyRole as EnemyRole]
    if (!enemyRoleConfig) throw new Error('TODO: 敵人沒有該角色配置')

    // TODO: 實體化敵人的完整邏輯
    return {
      templateId: rolledEnemyTemplateId,
      difficulty,
      role: stageEnemyRole,
    }
  }
}
