import { EnemyAggregate, EnemyRole } from '../../../../domain/entity/Enemy'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
import { IUltimateAggregateService } from '../ultimate/UltimateAggregateService'
// 定義 EnemyAggregate 服務介面
export interface IEnemyAggregateService {
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyAggregate
}
// 提供建立 EnemyAggregate 的服務
export class EnemyAggregateService implements IEnemyAggregateService {
  constructor(
    private readonly affixAggregateService: IAffixAggregateService,
    private readonly ultimateAggregateService: IUltimateAggregateService,
    private readonly appContextService: IAppContextService
  ) {}
  // 從樣板與當前上下文建立 EnemyAggregate
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyAggregate {
    const { enemyStore } = this.appContextService.getConfigStore()
    const enemyTemplate = enemyStore.getEnemy(enemyTemplateId)
    if (!enemyTemplate) {
      throw new Error(`敵人樣板不存在: ${enemyTemplateId}`)
    }
    const roleConfig = enemyTemplate.roleConfigs[role]
    if (!roleConfig) {
      throw new Error(`敵人缺少角色配置: ${enemyTemplateId} - ${role}`)
    }
    const affixAggregates = this.affixAggregateService.createManyByTemplateUsingCurrentContext(roleConfig.affixIds)
    const ultimateAggregate = this.ultimateAggregateService.createOneByTemplateUsingCurrentContext(
      roleConfig.ultimateId
    )
    return new EnemyAggregate(
      `enemy-aggregate-${enemyTemplateId}-${this.appContextService.getRunContext().seed}`,
      role,
      enemyTemplate,
      affixAggregates,
      ultimateAggregate
    )
  }
}
