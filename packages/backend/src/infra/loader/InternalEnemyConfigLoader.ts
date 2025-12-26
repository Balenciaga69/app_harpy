import {
  EnemyConfigDTO,
  IEnemyConfigLoader,
} from '../../application/core-infrastructure/static-config/loader/IConfigLoaders'
import { EnemyTemplateList, EnemyWeightList } from '../../data/enemy/enemy.data'
export class InternalEnemyConfigLoader implements IEnemyConfigLoader {
  async load(): Promise<EnemyConfigDTO> {
    const dto: EnemyConfigDTO = {
      enemyTemplates: EnemyTemplateList,
      spawnInfos: EnemyWeightList,
    }
    return Promise.resolve(dto)
  }
}
