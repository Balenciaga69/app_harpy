import { EnemyEntity, EnemyRole } from '../../../../domain/entity/Enemy'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IAffixEntityService } from '../affix/AffixEntityService'
import { IUltimateEntityService } from '../ultimate/UltimateEntityService'
/**
 * 敵人實體服務：負責建立 EnemyEntity
 * 職責：透過模板、詞綴實體、大絕招實體與當前上下文組裝完整的敵人實體
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )、IAffixEntityService、IUltimateEntityService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IEnemyEntityService {
  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyEntity
}
export class EnemyEntityService implements IEnemyEntityService {
  constructor(
    private affixEntityService: IAffixEntityService,
    private ultimateEntityService: IUltimateEntityService,
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}

  createOneByTemplateUsingCurrentContext(enemyTemplateId: string, role: EnemyRole): EnemyEntity {
    const { enemyStore } = this.configStoreAccessor.getConfigStore()
    const enemyTemplate = enemyStore.getEnemy(enemyTemplateId)
    const roleConfig = enemyTemplate.roleConfigs[role]
    const affix = this.affixEntityService.createManyByTemplateUsingCurrentContext(roleConfig.affixIds)
    const ultimate = this.ultimateEntityService.createOneByTemplateUsingCurrentContext(roleConfig.ultimateId)
    return new EnemyEntity(
      `enemy-entity-${enemyTemplateId}-${this.contextSnapshot.getRunContext().seed}`,
      role,
      enemyTemplate,
      affix,
      ultimate
    )
  }
}
