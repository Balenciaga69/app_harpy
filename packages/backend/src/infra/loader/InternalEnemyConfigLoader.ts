import { EnemyConfigDTO, IEnemyConfigLoader } from '../../application/loader/IEnemyConfigLoader'
import { EnemyConfigList, EnemyWeightList } from '../../data/enemy/enemy-spawn.data'

export class InternalEnemyConfigLoader implements IEnemyConfigLoader {
  async load(): Promise<EnemyConfigDTO> {
    return Promise.resolve({ configs: EnemyConfigList, weights: EnemyWeightList } as EnemyConfigDTO)
  }
}
