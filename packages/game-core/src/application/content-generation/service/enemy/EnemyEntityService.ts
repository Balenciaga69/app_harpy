import { EnemyEntity, EnemyRole } from '../../../../domain/entity/Enemy'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IAffixEntityService } from '../affix/AffixEntityService'
import { IUltimateEntityService } from '../ultimate/UltimateEntityService'
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
