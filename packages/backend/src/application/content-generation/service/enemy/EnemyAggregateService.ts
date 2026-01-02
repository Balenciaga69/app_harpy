import { EnemyEntity, EnemyRole } from '../../../../domain/entity/Enemy'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
import { IUltimateAggregateService } from '../ultimate/UltimateAggregateService'
/**
 * 敵人實體服務：負責建立 EnemyEntity
 * 職責：透過模板、詞綴實體、大絕招實體與當前上下文組裝完整的敵人實體
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )、IAffixAggregateService、IUltimateAggregateService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IEnemyAggregateService {
  /** 從模板與角色從當前上下文建立 EnemyEntity( 自動產生記錄、詞綴、大絕招 ) */
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyEntity
}
export class EnemyAggregateService implements IEnemyAggregateService {
  constructor(
    private affixAggregateService: IAffixAggregateService,
    private ultimateAggregateService: IUltimateAggregateService,
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 從敵人樣板與角色從當前上下文建立 EnemyEntity */
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyEntity {
    const { enemyStore } = this.configStoreAccessor.getConfigStore()
    const enemyTemplate = enemyStore.getEnemy(enemyTemplateId)
    const roleConfig = enemyTemplate.roleConfigs[role]
    const affixAggregates = this.affixAggregateService.createManyByTemplateUsingCurrentContext(roleConfig.affixIds)
    const ultimateAggregate = this.ultimateAggregateService.createOneByTemplateUsingCurrentContext(
      roleConfig.ultimateId
    )
    return new EnemyEntity(
      `enemy-aggregate-${enemyTemplateId}-${this.contextSnapshot.getRunContext().seed}`,
      role,
      enemyTemplate,
      affixAggregates,
      ultimateAggregate
    )
  }
}
