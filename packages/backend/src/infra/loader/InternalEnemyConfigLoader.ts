import { EnemyConfigDTO, IEnemyConfigLoader } from '../../application/static-config/loader/IEnemyConfigLoader'
import { EnemyWeightList } from '../../data/enemy/enemy-spawn.data'
import { EnemyTemplateList } from '../../data/enemy/templates/chemist-enemy.data'

export class InternalEnemyConfigLoader implements IEnemyConfigLoader {
  async load(): Promise<EnemyConfigDTO> {
    const dto: EnemyConfigDTO = {
      enemyTemplates: EnemyTemplateList,
      spawnInfos: EnemyWeightList,
    }
    return Promise.resolve(dto)
  }
}
