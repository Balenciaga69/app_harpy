import { EnemyConfigDTO, IEnemyConfigLoader } from '../../application/static-config/loader/IEnemyConfigLoader'
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
