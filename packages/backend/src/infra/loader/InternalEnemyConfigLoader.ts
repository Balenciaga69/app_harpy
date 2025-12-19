import { EnemyConfigDTO, IEnemyConfigLoader } from '../../application/store/IEnemyConfigLoader'
import { EnemyConfigList, EnemyWeightList } from '../../data/enemy/enemy-spawn.data'

export class InternalEnemyConfigLoader implements IEnemyConfigLoader {
  async load(): Promise<EnemyConfigDTO> {
    const dto: EnemyConfigDTO = {
      configs: EnemyConfigList,
      spawnInfos: EnemyWeightList,
    }
    return Promise.resolve(dto)
  }
}
