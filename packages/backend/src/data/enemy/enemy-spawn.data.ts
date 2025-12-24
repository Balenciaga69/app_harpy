import { EnemyConfig } from '../../application/static-config/loader/IEnemyConfigLoader'
import { EnemySpawnInfo } from '../../domain/entity/Enemy'
import { chemist_config } from './templates/chemist-package'

export const EnemyWeightList: EnemySpawnInfo[] = [
  { templateId: chemist_config.enemyTemplate.id, weight: 100, chapters: [1, 2, 3] },
]

export const EnemyConfigList: EnemyConfig[] = [chemist_config]
