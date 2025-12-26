import { EnemySpawnInfo, EnemyTemplate } from '../../../../domain/entity/Enemy'
export interface EnemyConfigDTO {
  enemyTemplates: EnemyTemplate[]
  spawnInfos: EnemySpawnInfo[]
}
export interface IEnemyConfigLoader {
  load(): Promise<EnemyConfigDTO>
}
