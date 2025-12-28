import { EnemyAggregate, EnemyRole } from '../../../../domain/entity/Enemy'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
import { IUltimateAggregateService } from '../ultimate/UltimateAggregateService'

/**
 * 敵人聚合根服務：負責建立 EnemyAggregate
 * 職責：透過模板、詞綴聚合根、大絕招聚合根與當前上下文組裝完整的敵人聚合根
 * 依賴：IConfigStoreAccessor（讀模板）、IContextSnapshotAccessor（讀難度資訊）、IAffixAggregateService、IUltimateAggregateService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IEnemyAggregateService {
  /** 從模板與角色從當前上下文建立 EnemyAggregate（自動產生記錄、詞綴、大絕招） */
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyAggregate
}

export class EnemyAggregateService implements IEnemyAggregateService {
  constructor(
    private affixAggregateService: IAffixAggregateService,
    private ultimateAggregateService: IUltimateAggregateService,
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 從敵人樣板與角色從當前上下文建立 EnemyAggregate */
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyAggregate {
    const { enemyStore } = this.configStoreAccessor.getConfigStore()
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
      `enemy-aggregate-${enemyTemplateId}-${this.contextSnapshot.getRunContext().seed}`,
      role,
      enemyTemplate,
      affixAggregates,
      ultimateAggregate
    )
  }
}
